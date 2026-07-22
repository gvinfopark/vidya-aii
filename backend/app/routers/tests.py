"""
app/routers/tests.py — Admin-facing test results list.

Matches AdminDashboard/index.js: GET /api/v1/tests
"""
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_admin
from app.utils import serialize_doc, oid
from app.models.schemas import TestScoreUpdateRequest

router = APIRouter(prefix="/tests", tags=["admin-tests"])


@router.get("")
@router.get("/")
async def list_all_test_results(admin: dict = Depends(get_current_admin)):
    db = get_db()
    results = []
    async for attempt in db.test_attempts.find({"status": "submitted"}).sort("submitted_at", -1).limit(200):
        item = serialize_doc(attempt)
        results.append(
            {
                "id": item["id"],
                "user": item.get("user_name", "Unknown"),
                "user_name": item.get("user_name", "Unknown"),
                "test": item.get("test_name", "Untitled Test"),
                "test_name": item.get("test_name", "Untitled Test"),
                "score": item.get("score", 0),
                "date": item.get("submitted_at"),
            }
        )
    return results


@router.put("/{attempt_id}/score")
async def update_test_score(
    attempt_id: str, body: TestScoreUpdateRequest, admin: dict = Depends(get_current_admin)
):
    """Inline-edit a test attempt's score from the admin dashboard."""
    db = get_db()
    result = await db.test_attempts.update_one(
        {"_id": oid(attempt_id)}, {"$set": {"score": body.score}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Test result not found")
    return {"detail": "Score updated", "score": body.score}
