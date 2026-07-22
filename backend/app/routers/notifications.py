"""
app/routers/notifications.py — Simple per-user notification list.
"""
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_user
from app.utils import serialize_doc, oid

router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
@router.get("/")
async def list_notifications(user: dict = Depends(get_current_user)):
    db = get_db()
    items = []
    async for n in db.notifications.find({"user_id": user["id"]}).sort("created_at", -1).limit(50):
        items.append(serialize_doc(n))
    return items


@router.post("/{notification_id}/read")
async def mark_read(notification_id: str, user: dict = Depends(get_current_user)):
    db = get_db()
    result = await db.notifications.update_one(
        {"_id": oid(notification_id), "user_id": user["id"]}, {"$set": {"read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"detail": "Marked as read"}


@router.post("/read-all")
async def mark_all_read(user: dict = Depends(get_current_user)):
    db = get_db()
    await db.notifications.update_many({"user_id": user["id"]}, {"$set": {"read": True}})
    return {"detail": "All notifications marked as read"}
