"""
app/routers/flashcards.py — Flashcard CRUD + spaced-repetition-lite review.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_user
from app.utils import serialize_doc, oid
from app.models.schemas import FlashcardCreate, FlashcardUpdate, FlashcardReview

router = APIRouter(prefix="/flashcards", tags=["flashcards"])


@router.get("")
@router.get("/")
async def list_flashcards(subject: str = None, topic: str = None, user: dict = Depends(get_current_user)):
    db = get_db()
    query = {"user_id": user["id"]}
    if subject:
        query["subject"] = subject
    if topic:
        query["topic"] = topic
    cards = []
    async for c in db.flashcards.find(query).sort("created_at", -1):
        cards.append(serialize_doc(c))
    return cards


@router.post("")
@router.post("/")
async def create_flashcard(body: FlashcardCreate, user: dict = Depends(get_current_user)):
    db = get_db()
    doc = body.model_dump()
    doc.update(
        {
            "user_id": user["id"],
            "correct_count": 0,
            "incorrect_count": 0,
            "created_at": datetime.now(timezone.utc),
            "last_reviewed": None,
        }
    )
    result = await db.flashcards.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize_doc(doc)


@router.put("/{card_id}")
async def update_flashcard(card_id: str, body: FlashcardUpdate, user: dict = Depends(get_current_user)):
    db = get_db()
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")
    result = await db.flashcards.update_one(
        {"_id": oid(card_id), "user_id": user["id"]}, {"$set": updates}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    updated = await db.flashcards.find_one({"_id": oid(card_id)})
    return serialize_doc(updated)


@router.delete("/{card_id}")
async def delete_flashcard(card_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.flashcards.delete_one({"_id": oid(card_id), "user_id": user["id"]})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    return {"detail": "Flashcard deleted"}


@router.post("/{card_id}/review")
async def review_flashcard(card_id: str, body: FlashcardReview, user: dict = Depends(get_current_user)):
    db = get_db()
    inc_field = "correct_count" if body.result == "correct" else "incorrect_count"
    result = await db.flashcards.update_one(
        {"_id": oid(card_id), "user_id": user["id"]},
        {"$inc": {inc_field: 1}, "$set": {"last_reviewed": datetime.now(timezone.utc)}},
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Flashcard not found")
    updated = await db.flashcards.find_one({"_id": oid(card_id)})
    return serialize_doc(updated)
