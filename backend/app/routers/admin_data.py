"""
app/routers/admin_data.py — Admin CRUD that goes beyond the existing
Users/Tests tabs: the mock-test question bank, cross-user flashcards
and study plans, and notification broadcasts.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_admin
from app.utils import serialize_doc, oid
from app.models.schemas import (
    MockTestCreate,
    MockTestUpdate,
    FlashcardUpdate,
    StudyPlanUpdate,
    NotificationBroadcast,
)

router = APIRouter(prefix="/admin", tags=["admin-data"])


# ── MOCK TESTS — full question-bank CRUD ────────────────────────────────────
@router.get("/mock-tests")
async def admin_list_mock_tests(admin: dict = Depends(get_current_admin)):
    db = get_db()
    tests = []
    async for t in db.mock_tests.find().sort("_id", -1):
        tests.append(serialize_doc(t))
    return tests


@router.post("/mock-tests")
async def admin_create_mock_test(body: MockTestCreate, admin: dict = Depends(get_current_admin)):
    db = get_db()
    doc = body.model_dump()
    for i, q in enumerate(doc["questions"]):
        if q.get("id") is None:
            q["id"] = i + 1
    result = await db.mock_tests.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/mock-tests/{test_id}")
async def admin_update_mock_test(
    test_id: str, body: MockTestUpdate, admin: dict = Depends(get_current_admin)
):
    db = get_db()
    updates = body.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    if "questions" in updates:
        for i, q in enumerate(updates["questions"]):
            if q.get("id") is None:
                q["id"] = i + 1
    result = await db.mock_tests.update_one({"_id": oid(test_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mock test not found")
    updated = await db.mock_tests.find_one({"_id": oid(test_id)})
    return serialize_doc(updated)


@router.delete("/mock-tests/{test_id}")
async def admin_delete_mock_test(test_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    result = await db.mock_tests.delete_one({"_id": oid(test_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mock test not found")
    return {"detail": "Mock test deleted"}


# ── FLASHCARDS — cross-user browse / edit / delete ──────────────────────────
@router.get("/flashcards")
async def admin_list_flashcards(user_id: str = None, admin: dict = Depends(get_current_admin)):
    db = get_db()
    query = {"user_id": user_id} if user_id else {}
    cards = []
    async for c in db.flashcards.find(query).sort("created_at", -1).limit(500):
        cards.append(serialize_doc(c))
    return cards


@router.put("/flashcards/{card_id}")
async def admin_update_flashcard(
    card_id: str, body: FlashcardUpdate, admin: dict = Depends(get_current_admin)
):
    db = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.flashcards.update_one({"_id": oid(card_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    updated = await db.flashcards.find_one({"_id": oid(card_id)})
    return serialize_doc(updated)


@router.delete("/flashcards/{card_id}")
async def admin_delete_flashcard(card_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    result = await db.flashcards.delete_one({"_id": oid(card_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return {"detail": "Flashcard deleted"}


# ── STUDY PLANS — cross-user browse / edit / delete ─────────────────────────
@router.get("/study-plans")
async def admin_list_study_plans(user_id: str = None, admin: dict = Depends(get_current_admin)):
    db = get_db()
    query = {"user_id": user_id} if user_id else {}
    plans = []
    async for p in db.study_plans.find(query).sort("date", -1).limit(500):
        plans.append(serialize_doc(p))
    return plans


@router.put("/study-plans/{plan_id}")
async def admin_update_study_plan(
    plan_id: str, body: StudyPlanUpdate, admin: dict = Depends(get_current_admin)
):
    db = get_db()
    updates = body.model_dump(exclude_unset=True, exclude_none=True)
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.study_plans.update_one({"_id": oid(plan_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Study plan not found")
    updated = await db.study_plans.find_one({"_id": oid(plan_id)})
    return serialize_doc(updated)


@router.delete("/study-plans/{plan_id}")
async def admin_delete_study_plan(plan_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    result = await db.study_plans.delete_one({"_id": oid(plan_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return {"detail": "Study plan deleted"}


# ── NOTIFICATIONS — broadcast + admin list / delete ─────────────────────────
@router.get("/notifications")
async def admin_list_notifications(admin: dict = Depends(get_current_admin)):
    db = get_db()
    items = []
    async for n in db.notifications.find().sort("created_at", -1).limit(200):
        items.append(serialize_doc(n))
    return items


@router.post("/notifications/broadcast")
async def admin_broadcast_notification(
    body: NotificationBroadcast, admin: dict = Depends(get_current_admin)
):
    db = get_db()
    now = datetime.now(timezone.utc)

    if body.user_id:
        targets = [body.user_id]
    else:
        targets = [str(u["_id"]) async for u in db.users.find({"role": {"$ne": "admin"}}, {"_id": 1})]

    docs = [
        {
            "user_id": uid,
            "title": body.title,
            "message": body.message,
            "type": body.type,
            "read": False,
            "created_at": now,
        }
        for uid in targets
    ]
    if docs:
        await db.notifications.insert_many(docs)
    return {"detail": f"Sent to {len(docs)} user(s)"}


@router.delete("/notifications/{notification_id}")
async def admin_delete_notification(notification_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    result = await db.notifications.delete_one({"_id": oid(notification_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "Notification deleted"}
