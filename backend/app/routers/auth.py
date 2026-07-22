"""
app/routers/auth.py — Signup / login / current-user endpoints.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, Depends, Request

from app.database import get_db
from app.security import hash_password, verify_password, create_access_token
from app.deps import get_current_user
from app.utils import serialize_doc
from app.models.schemas import (
    SignupRequest,
    LoginRequest,
    GoogleLoginRequest,
    TokenResponse,
    UserOut,
)

router = APIRouter(prefix="/auth", tags=["auth"])


def _issue_token(user_doc: dict) -> TokenResponse:
    user_out = UserOut(**serialize_doc(user_doc))
    token = create_access_token({"sub": user_out.id, "role": user_out.role})
    return TokenResponse(access_token=token, user=user_out)


@router.post("/signup", response_model=TokenResponse)
async def signup(body: SignupRequest):
    db = get_db()
    existing = await db.users.find_one({"email": body.email.lower()})
    if existing:
        raise HTTPException(status_code=400, detail="An account with this email already exists")

    now = datetime.now(timezone.utc)
    doc = {
        "name": body.name,
        "email": body.email.lower(),
        "password_hash": hash_password(body.password),
        "role": "student",
        "status": "Active",
        "progress": 0,
        "created_at": now,
        "lastLogin": now,
        "ipAddress": None,
    }
    result = await db.users.insert_one(doc)
    doc["_id"] = result.inserted_id
    await db.notifications.insert_one(
        {
            "user_id": str(result.inserted_id),
            "title": "Welcome to Vidhya!",
            "message": "Your account is ready. Start by taking a mock test or adding your first flashcard deck.",
            "type": "welcome",
            "read": False,
            "created_at": now,
        }
    )
    return _issue_token(doc)


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, request: Request):
    db = get_db()
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    if user.get("status") == "Suspended":
        raise HTTPException(status_code=403, detail="This account has been suspended")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "lastLogin": datetime.now(timezone.utc),
                "ipAddress": request.client.host if request.client else None,
            }
        },
    )
    user["lastLogin"] = datetime.now(timezone.utc)
    return _issue_token(user)


@router.post("/admin-login", response_model=TokenResponse)
async def admin_login(body: LoginRequest, request: Request):
    """Same credential check as /login but only succeeds for admin-role accounts."""
    db = get_db()
    user = await db.users.find_one({"email": body.email.lower()})
    if not user or not verify_password(body.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Incorrect email or password")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="This account does not have admin access")

    await db.users.update_one(
        {"_id": user["_id"]},
        {
            "$set": {
                "lastLogin": datetime.now(timezone.utc),
                "ipAddress": request.client.host if request.client else None,
            }
        },
    )
    return _issue_token(user)


@router.post("/google", response_model=TokenResponse)
async def google_login(body: GoogleLoginRequest):
    """
    Minimal Google-login endpoint: looks up or creates the user by email.
    NOTE: this trusts the email sent by the frontend after the frontend has
    already verified the Google OAuth token client-side. For production use,
    verify the Google ID token server-side before trusting the email.
    """
    db = get_db()
    email = body.email.lower()
    user = await db.users.find_one({"email": email})
    now = datetime.now(timezone.utc)
    if not user:
        doc = {
            "name": body.name or email.split("@")[0],
            "email": email,
            "password_hash": hash_password(body.google_id or email),
            "role": "student",
            "status": "Active",
            "progress": 0,
            "created_at": now,
            "lastLogin": now,
            "ipAddress": None,
        }
        result = await db.users.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc
    else:
        await db.users.update_one({"_id": user["_id"]}, {"$set": {"lastLogin": now}})

    return _issue_token(user)


@router.get("/me", response_model=UserOut)
async def me(user: dict = Depends(get_current_user)):
    return UserOut(**user)


@router.post("/logout")
async def logout(user: dict = Depends(get_current_user)):
    # JWTs are stateless here; logout is handled client-side by discarding the token.
    return {"detail": "Logged out"}
