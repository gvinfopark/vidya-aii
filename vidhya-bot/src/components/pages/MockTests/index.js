import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import {
  Atom,
  FlaskConical,
  Dna,
  ClipboardList,
  Calculator,
  PartyPopper,
  BookOpen,
  Dumbbell,
  CheckCircle2,
  XCircle,
  Timer,
  ClipboardEdit,
} from "lucide-react";
import { mockTests as mockTestsApi } from "../../../services/api";
import "../page.css";
import "./MockTests.css";

const SUBJECT_ICON = {
  Physics: Atom,
  Chemistry: FlaskConical,
  Biology: Dna,
  Maths: Calculator,
  Mathematics: Calculator,
};
const DIFF_COLOR = {
  Hard: { bg: "#fadbd8", c: "#c0392b" },
  Medium: { bg: "#fdebd0", c: "#c9922a" },
  Easy: { bg: "#d5f5e3", c: "#1e8449" },
};
const CARD_COLOR = {
  Physics: "#1a5276",
  Chemistry: "#7d3c98",
  Biology: "#1e8449",
  Maths: "#c9922a",
  Mathematics: "#c9922a",
};
const CARD_BG = {
  Physics: "#d6eaf8",
  Chemistry: "#e8daef",
  Biology: "#d5f5e3",
  Maths: "#fdebd0",
  Mathematics: "#fdebd0",
};

function normalizeTest(t) {
  const subject = t.subject || "General";
  return {
    ...t,
    icon: SUBJECT_ICON[subject] || ClipboardList,
    color: CARD_COLOR[subject] || "#c0392b",
    bg: CARD_BG[subject] || "#fadbd8",
    difficulty: t.difficulty || "Medium",
    duration: t.duration_minutes || 60,
    questions: (t.questions || []).map((q, i) => {
      const options = q.options || [];
      // correct_answer may be stored as the literal option text (e.g. "Newton")
      // or already as a numeric index — handle both.
      let ans = q.correct_answer;
      if (typeof ans === "string") {
        const idx = options.indexOf(ans);
        ans = idx !== -1 ? idx : ans;
      }
      return {
        id: q.id != null ? String(q.id) : String(i),
        q: q.text || q.question, // support both `text` (your DB schema) and `question`
        options,
        ans,
      };
    }),
  };
}

// ── Mock Test Session (talks to the real /mock-tests API) ─────────────
function TestSession({ test, onFinish, onBack }) {
  const total = test.questions.length;
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState(Array(total).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(test.duration * 60);
  const [attemptId, setAttemptId] = useState(null);
  const [starting, setStarting] = useState(true);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const startedAt = React.useRef(Date.now());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const attempt = await mockTestsApi.start(test.id);
        if (!cancelled) setAttemptId(attempt.id);
      } catch (err) {
        if (!cancelled) setError(err.message || "Could not start the test");
      } finally {
        if (!cancelled) setStarting(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (submitted || starting) return;
    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          doSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, starting]);

  const fmtTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  const pick = (i) => {
    if (submitted) return;
    const a = [...answers];
    a[current] = i;
    setAnswers(a);
  };

  const doSubmit = useCallback(async () => {
    if (submitted || !attemptId) return;
    setSubmitted(true);
    const answerMap = {};
    test.questions.forEach((q, i) => {
      if (answers[i] !== null) answerMap[q.id] = answers[i];
    });
    try {
      const timeTaken = Math.round((Date.now() - startedAt.current) / 1000);
      const graded = await mockTestsApi.submit(attemptId, {
        answers: answerMap,
        time_taken_seconds: timeTaken,
      });
      setResult(graded);
    } catch (err) {
      setError(err.message || "Could not submit the test");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitted, attemptId, answers]);

  if (starting) {
    return (
      <div className="page-state">
        <div className="page-state-spinner" />
        Starting test…
      </div>
    );
  }

  if (submitted) {
    const score = answers.filter((a, i) => a === test.questions[i].ans).length;
    const pct = result ? result.score : Math.round((score / total) * 100);
    return (
      <div className="mt-result">
        <div className="mt-result-card">
          <div className="mt-result-emoji">
            {pct >= 80 ? (
              <PartyPopper size={40} color="#1e8449" />
            ) : pct >= 50 ? (
              <BookOpen size={40} color="#c9922a" />
            ) : (
              <Dumbbell size={40} color="#c0392b" />
            )}
          </div>
          <h2 className="mt-result-title">{test.title}</h2>
          {!result && !error && (
            <div className="page-state">
              <div className="page-state-spinner" />
              Grading your attempt…
            </div>
          )}
          {error && <div className="page-state page-state-error">{error}</div>}
          {result && (
            <>
              <div className="mt-result-score">
                <span
                  className="mt-score-num"
                  style={{
                    color:
                      pct >= 80 ? "#1e8449" : pct >= 50 ? "#c9922a" : "#c0392b",
                  }}
                >
                  {score}/{total}
                </span>
                <span className="mt-score-pct">{pct}%</span>
              </div>
              <div className="mt-result-breakdown">
                {test.questions.map((q, i) => (
                  <div
                    key={q.id}
                    className={`mt-rb-row ${answers[i] === q.ans ? "correct" : "wrong"}`}
                  >
                    <span className="mt-rb-icon">
                      {answers[i] === q.ans ? (
                        <CheckCircle2 size={16} color="#1e8449" />
                      ) : (
                        <XCircle size={16} color="#c0392b" />
                      )}
                    </span>
                    <span className="mt-rb-q">{q.q}</span>
                    {answers[i] !== q.ans && q.options[q.ans] != null && (
                      <span className="mt-rb-ans">Ans: {q.options[q.ans]}</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
          <div className="mt-result-btns">
            <button className="mt-btn-primary" onClick={onBack}>
              ← Back to Tests
            </button>
            <button className="mt-btn-outline" onClick={onFinish}>
              View All Results
            </button>
          </div>
        </div>
      </div>
    );
  }

  const q = test.questions[current];
  const answered = answers.filter((a) => a !== null).length;
  const urgent = timeLeft < 120;

  return (
    <div className="mt-session">
      <div className="mt-session-topbar">
        <button className="mt-back-btn" onClick={onBack}>
          ← Exit
        </button>
        <div className="mt-session-info">
          <div className="mt-session-title">{test.title}</div>
        </div>
        <span className={`mt-timer ${urgent ? "urgent" : ""}`}>
          <Timer size={15} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          {fmtTime(timeLeft)}
        </span>
        <button className="mt-submit-btn" onClick={doSubmit}>
          Submit Test
        </button>
      </div>

      <div className="mt-progress-track">
        <div
          className="mt-progress-fill"
          style={{ width: `${(answered / total) * 100}%` }}
        />
      </div>

      <div className="mt-body">
        <div className="mt-q-panel">
          <div className="mt-q-meta">
            Question {current + 1} of {total} · {answered} answered
          </div>
          <div className="mt-q-text">{q.q}</div>
          <div className="mt-options">
            {q.options.map((opt, i) => (
              <button
                key={i}
                className={`mt-option ${answers[current] === i ? "selected" : ""}`}
                onClick={() => pick(i)}
              >
                <span className="mt-opt-letter">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>{opt}</span>
              </button>
            ))}
          </div>
          <div className="mt-nav-btns">
            <button
              className="mt-nav-btn"
              disabled={current === 0}
              onClick={() => setCurrent((c) => c - 1)}
            >
              ← Prev
            </button>
            {current < total - 1 ? (
              <button
                className="mt-nav-btn primary"
                onClick={() => setCurrent((c) => c + 1)}
              >
                Next →
              </button>
            ) : (
              <button className="mt-nav-btn primary" onClick={doSubmit}>
                Submit Test ✓
              </button>
            )}
          </div>
        </div>

        <div className="mt-palette-panel">
          <div className="mt-palette-title">Question Palette</div>
          <div className="mt-palette-grid">
            {test.questions.map((_, i) => (
              <button
                key={i}
                className={`mt-palette-btn ${i === current ? "active" : ""} ${answers[i] !== null ? "done" : ""}`}
                onClick={() => setCurrent(i)}
              >
                {i + 1}
              </button>
            ))}
          </div>
          <div className="mt-palette-legend">
            <span className="mt-legend-dot done" /> Answered
            <span className="mt-legend-dot" style={{ marginLeft: 14 }} /> Not
            answered
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main MockTests page ────────────────────────────────────────────────
const EXAM_TYPES = ["All", "NEET", "JEE", "State Board"];

export default function MockTests({ userName, onLogout }) {
  const [filter, setFilter] = useState("All");
  const [examFilter, setExamFilter] = useState("All");
  const [tests, setTests] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTest, setActiveTest] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [testList, myAttempts] = await Promise.all([
        mockTestsApi.list(),
        mockTestsApi.myAttempts().catch(() => []),
      ]);
      setTests(testList.map(normalizeTest));
      setAttempts(myAttempts);
    } catch (err) {
      setError(err.message || "Could not load mock tests");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const attemptCounts = attempts.reduce((acc, a) => {
    acc[a.test_id] = (acc[a.test_id] || 0) + 1;
    return acc;
  }, {});

  const filtered = tests
    .filter((t) => filter === "All" || t.difficulty === filter)
    .filter((t) => examFilter === "All" || t.exam_type === examFilter);

  if (activeTest) {
    return (
      <div style={{ width: "100%", minHeight: "100vh" }}>
        <TestSession
          test={activeTest}
          onBack={() => {
            setActiveTest(null);
            load();
          }}
          onFinish={() => {
            setActiveTest(null);
            load();
          }}
        />
      </div>
    );
  }

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav
          userName={userName}
          onLogout={onLogout}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="page-wrap">
            <div
              className="page-hero"
              style={{ background: "linear-gradient(135deg,#0d1b2a,#1a3a5c)" }}
            >
              <div className="page-hero-badge">
                <ClipboardEdit
                  size={14}
                  style={{ verticalAlign: "-2px", marginRight: 6 }}
                />
                Practice Arena
              </div>
              <h1>Mock Tests</h1>
              <p>
                Timed tests designed to simulate real exam conditions for NEET
                and JEE. Every attempt is saved to your account.
              </p>
              <div className="page-hero-meta">
                {[
                  [`${tests.length}`, "Tests"],
                  [`${attempts.length}`, "Your Attempts"],
                ].map(([n, l]) => (
                  <div key={l} className="page-hero-stat">
                    <div className="page-hero-stat-num">{n}</div>
                    <div className="page-hero-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
              {EXAM_TYPES.map((f) => (
                <button
                  key={f}
                  onClick={() => setExamFilter(f)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 20,
                    border: "1.5px solid",
                    borderColor: examFilter === f ? "#0d1b2a" : "var(--border)",
                    background: examFilter === f ? "#0d1b2a" : "white",
                    color: examFilter === f ? "white" : "var(--slate)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginBottom: 28, flexWrap: "wrap" }}>
              {["All", "Hard", "Medium", "Easy"].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: "7px 18px",
                    borderRadius: 20,
                    border: "1.5px solid",
                    borderColor: filter === f ? "var(--teal)" : "var(--border)",
                    background: filter === f ? "var(--teal)" : "white",
                    color: filter === f ? "white" : "var(--slate)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "'DM Sans',sans-serif",
                    transition: "all 0.2s",
                  }}
                >
                  {f}
                </button>
              ))}
            </div>

            <h2 className="page-section-title">
              Available <span>Tests</span>
            </h2>

            {loading && (
              <div className="page-state">
                <div className="page-state-spinner" />
                Loading tests…
              </div>
            )}
            {!loading && error && (
              <div className="page-state page-state-error">{error}</div>
            )}
            {!loading && !error && filtered.length === 0 && (
              <div className="page-state">
                No mock tests available yet. Check back soon.
              </div>
            )}

            {!loading && !error && filtered.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  marginBottom: 40,
                }}
              >
                {filtered.map((t) => (
                  <div
                    key={t.id}
                    className="list-row"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      padding: "14px 18px",
                      flexWrap: "nowrap",
                    }}
                  >
                    <div
                      className="list-row-icon"
                      style={{ background: t.bg, flexShrink: 0 }}
                    >
                      <t.icon size={20} color={t.color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
                      <div
                        className="list-row-title"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.title}
                      </div>
                      <div
                        className="list-row-sub"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {t.duration} min · {t.questions.length} Questions
                        {attemptCounts[t.id]
                          ? ` · ${attemptCounts[t.id]} attempt${attemptCounts[t.id] > 1 ? "s" : ""}`
                          : ""}
                      </div>
                    </div>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 700,
                        background: DIFF_COLOR[t.difficulty].bg,
                        color: DIFF_COLOR[t.difficulty].c,
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {t.difficulty}
                    </span>
                    <button
                      onClick={() => setActiveTest(t)}
                      style={{
                        flexShrink: 0,
                        width: 70,
                        padding: "5px 0",
                        borderRadius: 8,
                        border: "none",
                        background: t.color,
                        color: "#fff",
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Start →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
