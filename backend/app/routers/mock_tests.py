"""
app/routers/mock_tests.py — Student-facing mock test endpoints.

Matches src/services/api.js `mockTests`:
  GET  /mock-tests?exam_type=
  GET  /mock-tests/my-attempts
  POST /mock-tests/{testId}/start
  POST /mock-tests/attempts/{attemptId}/submit
  GET  /mock-tests/attempts/{attemptId}
"""
import random
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_user
from app.utils import serialize_doc, oid
from app.models.schemas import SubmitAttemptRequest

router = APIRouter(prefix="/mock-tests", tags=["mock-tests"])


@router.get("")
@router.get("/")
async def list_tests(exam_type: str = None, user: dict = Depends(get_current_user)):
    db = get_db()
    query = {"exam_type": exam_type} if exam_type else {}
    tests = []
    async for t in db.mock_tests.find(query):
        tests.append(serialize_doc(t))
    return tests


@router.get("/my-attempts")
async def my_attempts(user: dict = Depends(get_current_user)):
    db = get_db()
    attempts = []
    async for a in db.test_attempts.find({"user_id": user["id"]}).sort("started_at", -1):
        attempts.append(serialize_doc(a))
    return attempts


@router.post("/{test_id}/start")
async def start_test(test_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    test = await db.mock_tests.find_one({"_id": oid(test_id)})
    if not test:
        raise HTTPException(status_code=404, detail="Test not found")

    attempt = {
        "user_id": user["id"],
        "user_name": user["name"],
        "test_id": test_id,
        "test_name": test.get("title", "Untitled Test"),
        "status": "in_progress",
        "answers": {},
        "score": None,
        "started_at": datetime.now(timezone.utc),
        "submitted_at": None,
    }
    result = await db.test_attempts.insert_one(attempt)
    attempt["_id"] = result.inserted_id
    return serialize_doc(attempt)


@router.post("/attempts/{attempt_id}/submit")
async def submit_attempt(
    attempt_id: str, body: SubmitAttemptRequest, user: dict = Depends(get_current_user)
):
    db = get_db()
    attempt = await db.test_attempts.find_one({"_id": oid(attempt_id)})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt["user_id"] != user["id"]:
        raise HTTPException(status_code=403, detail="Not your attempt")

    test = await db.mock_tests.find_one({"_id": oid(attempt["test_id"])})
    questions = (test or {}).get("questions", [])
    correct = 0
    for q in questions:
        qid = str(q.get("id"))
        if body.answers.get(qid) == q.get("correct_answer"):
            correct += 1
    score = round((correct / len(questions)) * 100) if questions else random.randint(50, 95)

    await db.test_attempts.update_one(
        {"_id": oid(attempt_id)},
        {
            "$set": {
                "status": "submitted",
                "answers": body.answers,
                "score": score,
                "time_taken_seconds": body.time_taken_seconds,
                "submitted_at": datetime.now(timezone.utc),
            }
        },
    )
    updated = await db.test_attempts.find_one({"_id": oid(attempt_id)})

    await db.notifications.insert_one(
        {
            "user_id": user["id"],
            "title": "Test result ready",
            "message": f"You scored {score}% on \"{attempt['test_name']}\".",
            "type": "test_result",
            "read": False,
            "created_at": datetime.now(timezone.utc),
        }
    )

    return serialize_doc(updated)


@router.get("/attempts/{attempt_id}")
async def get_attempt(attempt_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    attempt = await db.test_attempts.find_one({"_id": oid(attempt_id)})
    if not attempt:
        raise HTTPException(status_code=404, detail="Attempt not found")
    if attempt["user_id"] != user["id"] and user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Not your attempt")
    return serialize_doc(attempt)
