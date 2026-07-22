# What changed

## Frontend — removed all mock data, wired to your real backend

| Page | Before | Now |
|---|---|---|
| `Home` | Hardcoded chapters, schedule, stats | Real data from `/analytics/dashboard`, `/progress`, `/study-plans` |
| `MockTests` | 6 hardcoded tests, client-only grading | Real tests from `/mock-tests`, attempts saved via `/mock-tests/{id}/start` + `/submit` (writes to `test_attempts`) |
| `Flashcards` | 7 hardcoded decks | Real cards from `/flashcards`, with **Add Flashcard** and **Delete Deck**, review stats posted to `/flashcards/{id}/review` |
| `StudyPlanner` | Static Mon–Sun plan | Real plans from `/study-plans`, with **Add Session** and working **Mark Done** toggle |
| `Progress` | Hardcoded chapters + fixed-date milestones | Real chapters from `/progress`, with **Add Chapter**; milestones now computed from your actual streak/completion data |
| `Analytics` | Hardcoded weekly scores/subjects/recent tests | Real data from `/analytics/dashboard`, `/analytics/subjects`, `/analytics/study-time`, and your real test attempts |
| `SideNav` | No notifications UI existed | New bell icon reading real data from `/notifications` |

Every page now shows a loading state, an error state, and an empty state ("no data yet — add your first one") instead of fake numbers.

## Backend — small additions

- `POST /auth/signup` now inserts a real "Welcome to Vidhya!" document into the `notifications` collection for the new user.
- `POST /mock-tests/attempts/{id}/submit` now inserts a real "Test result ready" notification after grading.
- New `backend/seed_data.py` — inserts 6 real NEET/JEE mock tests (with real questions, options, and answers) into your `mock_tests` collection, since that's the one collection that's admin-authored content rather than something a student generates through the UI.

## How to get real data into your `mock_tests` collection

Your other collections (`flashcards`, `study_plans`, `progress`, `test_attempts`, `notifications`) fill up naturally as users use the app — that's the point of wiring the frontend to the real CRUD endpoints. `mock_tests` is different: it's content you (the admin) provide, so run this once:

```bash
cd backend
python seed_data.py
```

It connects using the same `MONGODB_URL` from your `.env`, and is safe to re-run (upserts by title).

## Note on `users`

The `users` collection was already fully real (signup/login/admin dashboard all write to it) — no mock data existed there.
