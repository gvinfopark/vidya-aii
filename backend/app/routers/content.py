"""
app/routers/content.py — Site content management (CMS-lite).

Lets the admin dashboard edit frontend text, the announcement banner,
the Quick Access cards, section visibility, and accent/primary theme
colors — all stored in one MongoDB document and read live by the
React app.

  GET /api/v1/content   — public, no auth (frontend needs it to render)
  PUT /api/v1/content   — admin only, partial update (deep-merged)
"""
from fastapi import APIRouter, Depends

from app.database import get_db
from app.deps import get_current_admin
from app.models.schemas import SiteContentUpdate

router = APIRouter(prefix="/content", tags=["content"])

DEFAULT_CONTENT = {
    "hero": {
        "badge": "2025–26 Session Active",
        "title_line1": "Ready to Study?",
        "title_line2": "",
        "subtitle": "Your personalised dashboard is loaded. Continue where you left off or explore new chapters today.",
        "cta_primary_text": "Start Preparing",
        "cta_secondary_text": "Take a Mock Test",
    },
    "banner": {
        "enabled": False,
        "message": "",
        "type": "info",
    },
    "quick_access": [
        {"icon": "ClipboardList", "title": "Mock Tests", "sub": "Practice under real exam conditions", "path": "/mock-tests"},
        {"icon": "BarChart3", "title": "Analytics", "sub": "Track your progress", "path": "/analytics"},
        {"icon": "Layers", "title": "Flashcards", "sub": "Smart revision", "path": "/flashcards"},
        {"icon": "Target", "title": "Study Planner", "sub": "Custom schedule", "path": "/study-planner"},
    ],
    "sections": {
        "show_quick_access": True,
        "show_progress": True,
        "show_schedule": True,
        "show_banner": False,
    },
    "theme": {
        "accent": "#10A37F",
        "primary": "#0D0D0D",
    },
}


def _deep_merge(base: dict, override: dict) -> dict:
    result = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(result.get(k), dict):
            result[k] = _deep_merge(result[k], v)
        else:
            result[k] = v
    return result


@router.get("")
@router.get("/")
async def get_content():
    """Public — the whole frontend reads this on load to render dynamic content."""
    db = get_db()
    doc = await db.site_content.find_one({"_id": "singleton"})
    if not doc:
        return DEFAULT_CONTENT
    doc.pop("_id", None)
    return _deep_merge(DEFAULT_CONTENT, doc)


@router.put("")
@router.put("/")
async def update_content(body: SiteContentUpdate, admin: dict = Depends(get_current_admin)):
    """Admin-only partial update. Nested objects (hero/banner/sections/theme) are
    deep-merged so admins can change a single field without resending everything.
    quick_access is a list, so sending it replaces the whole list (add/remove/reorder)."""
    db = get_db()
    updates = body.model_dump(exclude_unset=True, exclude_none=True)

    current = await db.site_content.find_one({"_id": "singleton"}) or {}
    current.pop("_id", None)

    merged = _deep_merge(_deep_merge(DEFAULT_CONTENT, current), updates)
    await db.site_content.update_one({"_id": "singleton"}, {"$set": merged}, upsert=True)
    return merged
