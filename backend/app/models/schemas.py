"""
app/models/schemas.py — Pydantic request/response models.
"""
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, EmailStr, Field


# ── AUTH ──────────────────────────────────────────────────────────────────────
class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str = Field(min_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class GoogleLoginRequest(BaseModel):
    name: Optional[str] = None
    email: EmailStr
    google_id: Optional[str] = None


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str = "student"
    status: str = "Active"
    progress: int = 0
    lastLogin: Optional[datetime] = None
    ipAddress: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ── USER STATUS ───────────────────────────────────────────────────────────────
class StatusUpdateRequest(BaseModel):
    status: str


class UserUpdateRequest(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    progress: Optional[int] = Field(default=None, ge=0, le=100)


# ── ADMIN TEST RESULTS ───────────────────────────────────────────────────────
class TestScoreUpdateRequest(BaseModel):
    score: int = Field(ge=0, le=100)


# ── MOCK TESTS ────────────────────────────────────────────────────────────────
class SubmitAttemptRequest(BaseModel):
    answers: dict = {}
    time_taken_seconds: Optional[int] = None


# ── FLASHCARDS ────────────────────────────────────────────────────────────────
class FlashcardCreate(BaseModel):
    subject: str
    topic: Optional[str] = None
    question: str
    answer: str


class FlashcardUpdate(BaseModel):
    subject: Optional[str] = None
    topic: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None


class FlashcardReview(BaseModel):
    result: str  # "correct" | "incorrect" | "skipped"


# ── STUDY PLANS ───────────────────────────────────────────────────────────────
class StudySession(BaseModel):
    id: Optional[str] = None
    title: str
    subject: Optional[str] = None
    start_time: Optional[str] = None
    duration_minutes: Optional[int] = 60
    completed: bool = False


class StudyPlanCreate(BaseModel):
    title: str
    date: str
    sessions: List[StudySession] = []


class StudyPlanUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    sessions: Optional[List[StudySession]] = None


# ── PROGRESS ──────────────────────────────────────────────────────────────────
class ChapterProgress(BaseModel):
    subject: str
    chapter: str
    completion: int = 0


class StreakUpdate(BaseModel):
    increment: bool = True


# ── SITE CONTENT (admin-editable frontend content/layout/theme) ───────────────
class HeroContent(BaseModel):
    badge: Optional[str] = None
    title_line1: Optional[str] = None
    title_line2: Optional[str] = None
    subtitle: Optional[str] = None
    cta_primary_text: Optional[str] = None
    cta_secondary_text: Optional[str] = None


class BannerContent(BaseModel):
    enabled: Optional[bool] = None
    message: Optional[str] = None
    type: Optional[str] = None  # info | warning | success


class QuickAccessItem(BaseModel):
    icon: str = "Sparkles"
    title: str
    sub: str = ""
    path: str = "/home"


class SectionToggles(BaseModel):
    show_quick_access: Optional[bool] = None
    show_progress: Optional[bool] = None
    show_schedule: Optional[bool] = None
    show_banner: Optional[bool] = None


class ThemeColors(BaseModel):
    accent: Optional[str] = None
    primary: Optional[str] = None


class SiteContentUpdate(BaseModel):
    hero: Optional[HeroContent] = None
    banner: Optional[BannerContent] = None
    quick_access: Optional[List[QuickAccessItem]] = None
    sections: Optional[SectionToggles] = None
    theme: Optional[ThemeColors] = None


# ── ADMIN: MOCK TEST QUESTION-BANK CRUD ────────────────────────────────────────
class MockTestQuestion(BaseModel):
    id: Optional[int] = None
    text: str
    options: List[str]
    correct_answer: str


class MockTestCreate(BaseModel):
    title: str
    exam_type: str
    duration_minutes: int = 60
    questions: List[MockTestQuestion] = []


class MockTestUpdate(BaseModel):
    title: Optional[str] = None
    exam_type: Optional[str] = None
    duration_minutes: Optional[int] = None
    questions: Optional[List[MockTestQuestion]] = None


# ── ADMIN: NOTIFICATION BROADCAST ──────────────────────────────────────────────
class NotificationBroadcast(BaseModel):
    title: str
    message: str
    type: str = "announcement"
    user_id: Optional[str] = None  # omit / null = broadcast to every student
