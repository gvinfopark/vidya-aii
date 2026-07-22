"""
app/routers/analytics.py — Aggregated dashboard analytics for a student.
"""
from datetime import datetime, timezone, timedelta
from collections import defaultdict

from fastapi import APIRouter, Depends

from app.database import get_db
from app.deps import get_current_user

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard")
async def dashboard(user: dict = Depends(get_current_user)):
    db = get_db()

    total_attempts = await db.test_attempts.count_documents(
        {"user_id": user["id"], "status": "submitted"}
    )
    scores = []
    async for a in db.test_attempts.find(
        {"user_id": user["id"], "status": "submitted"}
    ):
        if a.get("score") is not None:
            scores.append(a["score"])
    avg_score = round(sum(scores) / len(scores)) if scores else 0

    total_cards = await db.flashcards.count_documents({"user_id": user["id"]})
    progress_doc = await db.progress.find_one({"user_id": user["id"]}) or {}

    return {
        "tests_taken": total_attempts,
        "average_score": avg_score,
        "flashcards_created": total_cards,
        "streak_days": progress_doc.get("streak_days", 0),
        "overall_progress": user.get("progress", 0),
    }


@router.get("/subjects")
async def subjects(user: dict = Depends(get_current_user)):
    db = get_db()
    progress_doc = await db.progress.find_one({"user_id": user["id"]}) or {}
    chapters = progress_doc.get("chapters", [])

    by_subject = defaultdict(list)
    for c in chapters:
        by_subject[c.get("subject", "General")].append(c.get("completion", 0))

    return [
        {"subject": subject, "average_completion": round(sum(vals) / len(vals))}
        for subject, vals in by_subject.items()
    ]


@router.get("/study-time")
async def study_time(days: int = 30, user: dict = Depends(get_current_user)):
    db = get_db()
    since = datetime.now(timezone.utc) - timedelta(days=days)

    daily_minutes = defaultdict(int)
    async for plan in db.study_plans.find(
        {"user_id": user["id"], "created_at": {"$gte": since}}
    ):
        for s in plan.get("sessions", []):
            if s.get("completed"):
                daily_minutes[plan.get("date", "unknown")] += s.get("duration_minutes", 0)

    return [{"date": date, "minutes": minutes} for date, minutes in sorted(daily_minutes.items())]
