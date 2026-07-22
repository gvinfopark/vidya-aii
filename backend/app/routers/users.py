"""
app/routers/users.py — Admin user management.

Matches the calls made by AdminDashboard/index.js:
  GET    /api/v1/users/
  PUT    /api/v1/users/{id}/status
  DELETE /api/v1/users/{id}
"""
from fastapi import APIRouter, Depends, HTTPException

from app.database import get_db
from app.deps import get_current_admin
from app.utils import serialize_doc, oid
from app.models.schemas import StatusUpdateRequest, UserUpdateRequest

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/")
async def list_users(admin: dict = Depends(get_current_admin)):
    db = get_db()
    users = []
    async for u in db.users.find({"role": {"$ne": "admin"}}).sort("created_at", -1):
        users.append(serialize_doc(u))
    return users


@router.put("/{user_id}")
async def update_user(
    user_id: str, body: UserUpdateRequest, admin: dict = Depends(get_current_admin)
):
    """Inline-edit a user's name / email / progress from the admin dashboard."""
    db = get_db()
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    if "email" in updates:
        updates["email"] = updates["email"].lower()
        clash = await db.users.find_one(
            {"email": updates["email"], "_id": {"$ne": oid(user_id)}}
        )
        if clash:
            raise HTTPException(status_code=409, detail="Email already in use")

    result = await db.users.update_one({"_id": oid(user_id)}, {"$set": updates})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")

    updated = await db.users.find_one({"_id": oid(user_id)})
    return serialize_doc(updated)


@router.put("/{user_id}/status")
async def update_user_status(
    user_id: str, body: StatusUpdateRequest, admin: dict = Depends(get_current_admin)
):
    db = get_db()
    result = await db.users.update_one(
        {"_id": oid(user_id)}, {"$set": {"status": body.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    return {"detail": "Status updated", "status": body.status}


@router.delete("/{user_id}")
async def delete_user(user_id: str, admin: dict = Depends(get_current_admin)):
    db = get_db()
    result = await db.users.delete_one({"_id": oid(user_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    # Clean up related data
    await db.test_attempts.delete_many({"user_id": user_id})
    await db.flashcards.delete_many({"user_id": user_id})
    await db.study_plans.delete_many({"user_id": user_id})
    await db.progress.delete_many({"user_id": user_id})
    return {"detail": "User deleted"}
