"""
app/main.py — Vidhya backend entrypoint.

Run with:
    uvicorn app.main:app --reload --port 5000
"""
import logging
from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection, get_db
from app.security import hash_password

from app.routers import (
    auth,
    users,
    tests,
    mock_tests,
    flashcards,
    study_plans,
    progress,
    analytics,
    notifications,
    content,
    admin_data,
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("vidhya")

app = FastAPI(title="Vidhya API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"
app.include_router(auth.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=API_PREFIX)
app.include_router(tests.router, prefix=API_PREFIX)
app.include_router(mock_tests.router, prefix=API_PREFIX)
app.include_router(flashcards.router, prefix=API_PREFIX)
app.include_router(study_plans.router, prefix=API_PREFIX)
app.include_router(progress.router, prefix=API_PREFIX)
app.include_router(analytics.router, prefix=API_PREFIX)
app.include_router(notifications.router, prefix=API_PREFIX)
app.include_router(content.router, prefix=API_PREFIX)
app.include_router(admin_data.router, prefix=API_PREFIX)


@app.get("/")
async def root():
    return {"status": "ok", "service": "Vidhya API"}


@app.get("/health")
async def health():
    return {"status": "healthy"}


async def _seed_admin():
    db = get_db()
    existing = await db.users.find_one({"email": settings.ADMIN_EMAIL.lower()})
    if existing:
        return
    await db.users.insert_one(
        {
            "name": settings.ADMIN_NAME,
            "email": settings.ADMIN_EMAIL.lower(),
            "password_hash": hash_password(settings.ADMIN_PASSWORD),
            "role": "admin",
            "status": "Active",
            "progress": 0,
            "created_at": datetime.now(timezone.utc),
            "lastLogin": None,
            "ipAddress": None,
        }
    )
    logger.info("Seeded default admin account: %s", settings.ADMIN_EMAIL)


async def _seed_demo_mock_tests():
    db = get_db()
    count = await db.mock_tests.count_documents({})
    if count > 0:
        return
    demo_tests = [
        {
            "title": "NEET Physics — Full Syllabus Mock 1",
            "exam_type": "NEET",
            "duration_minutes": 180,
            "questions": [
                {"id": 1, "text": "SI unit of force?", "options": ["Newton", "Joule", "Watt", "Pascal"], "correct_answer": "Newton"},
                {"id": 2, "text": "Acceleration due to gravity (approx)?", "options": ["8.9", "9.8", "10.8", "11.2"], "correct_answer": "9.8"},
            ],
        },
        {
            "title": "JEE Mathematics — Algebra Mock 1",
            "exam_type": "JEE",
            "duration_minutes": 180,
            "questions": [
                {"id": 1, "text": "Value of i^2?", "options": ["1", "-1", "0", "i"], "correct_answer": "-1"},
            ],
        },
        {
            "title": "State Board Mock Test — General Science 1",
            "exam_type": "State Board",
            "duration_minutes": 60,
            "questions": [
                {"id": 1, "text": "SI unit of power?", "options": ["Joule", "Newton", "Watt", "Pascal"], "correct_answer": "Watt"},
                {"id": 2, "text": "Basic unit of life?", "options": ["Tissue", "Organ", "Cell", "Organelle"], "correct_answer": "Cell"},
            ],
        },
    ]
    await db.mock_tests.insert_many(demo_tests)
    logger.info("Seeded %d demo mock tests", len(demo_tests))


@app.on_event("startup")
async def on_startup():
    await connect_to_mongo()
    await _seed_admin()
    await _seed_demo_mock_tests()


@app.on_event("shutdown")
async def on_shutdown():
    await close_mongo_connection()
