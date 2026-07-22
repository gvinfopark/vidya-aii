/**
 * services/api.js — Central API layer for Vidhya frontend
 * Reads base URL from environment variable so it works
 * both locally (localhost:5000) and in production.
 */

const BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:5000/api/v1";

// ── VIDYA AI (Groq) default key ────────────────────────────────────────────────
// Pre-provisioned so every student gets a working VIDYA AI tutor immediately
// after logging in, with no manual key setup. Students (or admins) can still
// swap it out any time from the "Change API Key" control on the dashboard.
// WARNING: Stored via environment variable to pass GitHub push protection.
export const DEFAULT_GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY || "";
export const GROQ_KEY_STORAGE = "vidya_groq_key";

export const ensureDefaultGroqKey = () => {
  try {
    if (!localStorage.getItem(GROQ_KEY_STORAGE) && DEFAULT_GROQ_API_KEY) {
      localStorage.setItem(GROQ_KEY_STORAGE, DEFAULT_GROQ_API_KEY);
    }
  } catch {
    /* localStorage unavailable — non-blocking */
  }
};

// ── Auth helpers ──────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem("vidhya_token");
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem("vidhya_user"));
  } catch {
    return null;
  }
};
export const saveSession = (token, user) => {
  localStorage.setItem("vidhya_token", token);
  localStorage.setItem("vidhya_user", JSON.stringify(user));
};
export const clearSession = () => {
  localStorage.removeItem("vidhya_token");
  localStorage.removeItem("vidhya_user");
};

// ── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(method, path, body = null, auth = true) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE}${path}`, options);
    const data = await res.json();

    if (!res.ok) {
      const msg = data?.detail || data?.message || `Error ${res.status}`;
      if (res.status === 401) {
        clearSession();
        window.location.href = "/login";
      }
      throw new Error(msg);
    }
    return data;
  } catch (err) {
    // Network error — backend not running
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        "Cannot connect to server. Make sure your backend is running on port 5000.",
      );
    }
    throw err;
  }
}

const get = (path) => request("GET", path);
const post = (path, body) => request("POST", path, body);
const put = (path, body) => request("PUT", path, body);
const del = (path) => request("DELETE", path);
const postNoAuth = (path, body) => request("POST", path, body, false);

// ── AUTH ──────────────────────────────────────────────────────────────────────
export const auth = {
  signup: (body) => postNoAuth("/auth/signup", body),
  login: (body) => postNoAuth("/auth/login", body),
  adminLogin: (body) => postNoAuth("/auth/admin-login", body),
  google: (body) => postNoAuth("/auth/google", body),
  me: () => get("/auth/me"),
  logout: () => post("/auth/logout"),
};

// ── ADMIN ─────────────────────────────────────────────────────────────────────
export const admin = {
  listUsers: () => get("/users/"),
  updateUser: (userId, body) => put(`/users/${userId}`, body),
  updateStatus: (userId, status) => put(`/users/${userId}/status`, { status }),
  deleteUser: (userId) => del(`/users/${userId}`),
  listTests: () => get("/tests"),
  updateTestScore: (attemptId, score) =>
    put(`/tests/${attemptId}/score`, { score }),

  // Mock test question-bank CRUD
  listMockTests: () => get("/admin/mock-tests"),
  createMockTest: (body) => post("/admin/mock-tests", body),
  updateMockTest: (id, body) => put(`/admin/mock-tests/${id}`, body),
  deleteMockTest: (id) => del(`/admin/mock-tests/${id}`),

  // Cross-user flashcards
  listFlashcards: (userId) =>
    get(`/admin/flashcards${userId ? `?user_id=${userId}` : ""}`),
  updateFlashcard: (id, body) => put(`/admin/flashcards/${id}`, body),
  deleteFlashcard: (id) => del(`/admin/flashcards/${id}`),

  // Cross-user study plans
  listStudyPlans: (userId) =>
    get(`/admin/study-plans${userId ? `?user_id=${userId}` : ""}`),
  updateStudyPlan: (id, body) => put(`/admin/study-plans/${id}`, body),
  deleteStudyPlan: (id) => del(`/admin/study-plans/${id}`),

  // Notification broadcasts
  listNotifications: () => get("/admin/notifications"),
  broadcastNotification: (body) => post("/admin/notifications/broadcast", body),
  deleteNotification: (id) => del(`/admin/notifications/${id}`),
};

// ── SITE CONTENT (admin-editable frontend content/layout/theme) ───────────────
export const content = {
  get: () => get("/content"),
  update: (body) => put("/content", body),
};

// ── ANALYTICS / DASHBOARD ─────────────────────────────────────────────────────
export const analytics = {
  dashboard: () => get("/analytics/dashboard"),
  subjects: () => get("/analytics/subjects"),
  studyTime: (days = 30) => get(`/analytics/study-time?days=${days}`),
};

// ── MOCK TESTS ────────────────────────────────────────────────────────────────
export const mockTests = {
  list: (examType) =>
    get(`/mock-tests${examType ? `?exam_type=${examType}` : ""}`),
  myAttempts: () => get("/mock-tests/my-attempts"),
  start: (testId) => post(`/mock-tests/${testId}/start`),
  submit: (attemptId, body) =>
    post(`/mock-tests/attempts/${attemptId}/submit`, body),
  detail: (attemptId) => get(`/mock-tests/attempts/${attemptId}`),
};

// ── FLASHCARDS ────────────────────────────────────────────────────────────────
export const flashcards = {
  list: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return get(`/flashcards${q ? `?${q}` : ""}`);
  },
  create: (body) => post("/flashcards", body),
  update: (id, body) => put(`/flashcards/${id}`, body),
  remove: (id) => del(`/flashcards/${id}`),
  review: (id, body) => post(`/flashcards/${id}/review`, body),
};

// ── STUDY PLANNER ─────────────────────────────────────────────────────────────
export const studyPlans = {
  list: () => get("/study-plans"),
  create: (body) => post("/study-plans", body),
  update: (id, body) => put(`/study-plans/${id}`, body),
  remove: (id) => del(`/study-plans/${id}`),
  toggleSession: (planId, sessionId) =>
    post(`/study-plans/${planId}/sessions/${sessionId}/toggle`),
};

// ── PROGRESS ──────────────────────────────────────────────────────────────────
export const progress = {
  get: () => get("/progress"),
  addChapter: (body) => post("/progress/chapters", body),
  updateChapter: (id, body) => put(`/progress/chapters/${id}`, body),
  updateStreak: (body) => post("/progress/streak", body),
};

// ── NOTIFICATIONS ─────────────────────────────────────────────────────────────
export const notifications = {
  list: () => get("/notifications"),
  markRead: (id) => post(`/notifications/${id}/read`),
  markAll: () => post("/notifications/read-all"),
};
