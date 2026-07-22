"""
app/routers/study_plans.py — Study planner CRUD.
"""
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_user
from app.utils import serialize_doc, oid
from app.models.schemas import StudyPlanCreate, StudyPlanUpdate

router = APIRouter(prefix="/study-plans", tags=["study-plans"])


@router.get("")
@router.get("/")
async def list_plans(user: dict = Depends(get_current_user)):
    db = get_db()
    plans = []
    async for p in db.study_plans.find({"user_id": user["id"]}).sort("date", 1):
        plans.append(serialize_doc(p))
    return plans


@router.post("")
@router.post("/")
async def create_plan(body: StudyPlanCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    sessions = []
    for s in body.sessions:
        s_dict = s.model_dump()
        s_dict["id"] = s_dict.get("id") or uuid.uuid4().hex[:8]
        sessions.append(s_dict)

    doc = {
        "user_id": user["id"],
        "title": body.title,
        "date": body.date,
        "sessions": sessions,
        "created_at": datetime.now(timezone.utc),
    }
    result = await db.study_plans.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{plan_id}")
async def update_plan(plan_id: str, body: StudyPlanUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_none=True).items()}
    if "sessions" in updates:
        updates["sessions"] = [s if isinstance(s, dict) else s for s in updates["sessions"]]
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.study_plans.update_one(
        {"_id": oid(plan_id), "user_id": user["id"]}, {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Study plan not found")
    updated = await db.study_plans.find_one({"_id": oid(plan_id)})
    return serialize_doc(updated)


@router.delete("/{plan_id}")
async def delete_plan(plan_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.study_plans.delete_one({"_id": oid(plan_id), "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Study plan not found")
    return {"detail": "Study plan deleted"}


@router.post("/{plan_id}/sessions/{session_id}/toggle")
async def toggle_session(plan_id: str, session_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    plan = await db.study_plans.find_one({"_id": oid(plan_id), "user_id": user["id"]})
    if not plan:
        raise HTTPException(status_code=404, detail="Study plan not found")

    sessions = plan.get("sessions", [])
    found = False
    for s in sessions:
        if s.get("id") == session_id:
            s["completed"] = not s.get("completed", False)
            found = True
            break
    if not found:
        raise HTTPException(status_code=404, detail="Session not found")

    await db.study_plans.update_one({"_id": oid(plan_id)}, {"$set": {"sessions": sessions}})
    updated = await db.study_plans.find_one({"_id": oid(plan_id)})
    return serialize_doc(updated)
