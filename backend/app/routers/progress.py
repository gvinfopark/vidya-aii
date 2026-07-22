"""
app/routers/progress.py — Chapter completion + streak tracking.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.database import get_db
from app.deps import get_current_user
from app.utils import serialize_doc, oid
from app.models.schemas import ChapterProgress, StreakUpdate

router = APIRouter(prefix="/progress", tags=["progress"])


async def _get_or_create_progress(db, user_id: str):
    doc = await db.progress.find_one({"user_id": user_id})
    if not doc:
        doc = {
            "user_id": user_id,
            "chapters": [],
            "streak_days": 0,
            "last_active_date": None,
            "updated_at": datetime.now(timezone.utc),
        }
        result = await db.progress.insert_one(doc)
        doc["_id"] = result.inserted_id
    return doc


@router.get("")
@router.get("/")
async def get_progress(user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await _get_or_create_progress(db, user["id"])
    return serialize_doc(doc)


@router.post("/chapters")
async def add_chapter(body: ChapterProgress, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await _get_or_create_progress(db, user["id"])
    chapters = doc.get("chapters", [])
    new_chapter = body.model_dump()
    new_chapter["id"] = str(len(chapters) + 1)
    chapters.append(new_chapter)

    completion_avg = round(sum(c["completion"] for c in chapters) / len(chapters))
    await db.progress.update_one(
        {"_id": doc["_id"]},
        {"$set": {"chapters": chapters, "updated_at": datetime.now(timezone.utc)}},
    )
    await db.users.update_one(
        {"_id": oid(user["id"])},
        {"$set": {"progress": completion_avg}},
    )
    updated = await db.progress.find_one({"_id": doc["_id"]})
    return serialize_doc(updated)


@router.put("/chapters/{chapter_id}")
async def update_chapter(chapter_id: str, body: ChapterProgress, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await _get_or_create_progress(db, user["id"])
    chapters = doc.get("chapters", [])
    for c in chapters:
        if c.get("id") == chapter_id:
            c.update(body.model_dump())
            break

    completion_avg = round(sum(c["completion"] for c in chapters) / len(chapters)) if chapters else 0
    await db.progress.update_one(
        {"_id": doc["_id"]},
        {"$set": {"chapters": chapters, "updated_at": datetime.now(timezone.utc)}},
    )
    await db.users.update_one(
        {"_id": oid(user["id"])}, {"$set": {"progress": completion_avg}}
    )
    updated = await db.progress.find_one({"_id": doc["_id"]})
    return serialize_doc(updated)


@router.post("/streak")
async def update_streak(body: StreakUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = await _get_or_create_progress(db, user["id"])
    streak = doc.get("streak_days", 0)
    streak = streak + 1 if body.increment else max(0, streak - 1)

    await db.progress.update_one(
        {"_id": doc["_id"]},
        {
            "$set": {
                "streak_days": streak,
                "last_active_date": datetime.now(timezone.utc),
                "updated_at": datetime.now(timezone.utc),
            }
        },
    )
    updated = await db.progress.find_one({"_id": doc["_id"]})
    return serialize_doc(updated)
