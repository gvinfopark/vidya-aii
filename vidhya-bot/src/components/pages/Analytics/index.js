import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Flame, Timer, Target, TrendingUp, ClipboardList, BarChart3 } from "lucide-react";
import { analytics as analyticsApi, mockTests as mockTestsApi } from "../../../services/api";
import { subjectStyle, fmtDate } from "../subjectStyle";
import "../page.css";

export default function Analytics({ userName, onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [studyTime, setStudyTime] = useState([]);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hovered, setHovered] = useState(null);
  const [collapsed, setCollapsed] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, subs, study, attempts] = await Promise.all([
        analyticsApi.dashboard(),
        analyticsApi.subjects(),
        analyticsApi.studyTime(7),
        mockTestsApi.myAttempts().catch(() => []),
      ]);
      setDashboard(dash);
      setSubjects(subs);
      setStudyTime(study);
      setRecentAttempts(attempts.filter((a) => a.status === "submitted").slice(0, 5));
    } catch (err) {
      setError(err.message || "Could not load analytics");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const maxMinutes = Math.max(1, ...studyTime.map((w) => w.minutes));
  const last7 = studyTime.slice(-7);

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="page-wrap">
            <div className="page-hero" style={{ background: "linear-gradient(135deg,#0d2a1e,#1a7f74)" }}>
              <div className="page-hero-badge"><BarChart3 size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Your Insights</div>
              <h1>Analytics</h1>
              <p>A real-time look at your performance, built from your own test attempts and study data.</p>
              <div className="page-hero-meta">
                {[[`${dashboard?.tests_taken ?? 0}`, "Tests Done"], [`${dashboard?.average_score ?? 0}%`, "Avg Score"], [`${dashboard?.streak_days ?? 0}`, "Day Streak"]].map(([n, l]) => (
                  <div key={l} className="page-hero-stat">
                    <div className="page-hero-stat-num">{n}</div>
                    <div className="page-hero-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {loading && <div className="page-state"><div className="page-state-spinner" />Loading analytics…</div>}
            {!loading && error && <div className="page-state page-state-error">{error}</div>}

            {!loading && !error && (
              <>
                {/* Key Insights */}
                <h2 className="page-section-title">Key <span>Insights</span></h2>
                <div className="card-grid" style={{ marginBottom: 40 }}>
                  {[
                    { icon: Flame, title: "Streak", value: `${dashboard?.streak_days ?? 0} days`, sub: "Keep it going!" },
                    { icon: Target, title: "Average Score", value: `${dashboard?.average_score ?? 0}%`, sub: `${dashboard?.tests_taken ?? 0} tests taken` },
                    { icon: ClipboardList, title: "Flashcards", value: `${dashboard?.flashcards_created ?? 0}`, sub: "cards created" },
                    { icon: TrendingUp, title: "Overall Progress", value: `${dashboard?.overall_progress ?? 0}%`, sub: "syllabus completion" },
                  ].map((ins, i) => (
                    <div key={i} className="info-card" style={{ textAlign: "center", cursor: "default" }}>
                      <div style={{ fontSize: 32, marginBottom: 10, display: "flex", justifyContent: "center" }}><ins.icon size={30} color="var(--teal, #1a7f74)" /></div>
                      <div style={{ fontSize: 28, fontFamily: "var(--font-sans, 'Inter', sans-serif)", fontWeight: 800, color: "var(--ink)", marginBottom: 4 }}>{ins.value}</div>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "var(--slate)", marginBottom: 4 }}>{ins.title}</div>
                      <div style={{ fontSize: 12, color: "var(--muted)" }}>{ins.sub}</div>
                    </div>
                  ))}
                </div>

                {/* Study Time Chart */}
                <h2 className="page-section-title">Study Time <span>(Last 7 Days)</span></h2>
                <div style={{ background: "white", border: "1.5px solid var(--border)", borderRadius: 20, padding: "28px 32px", marginBottom: 40 }}>
                  {last7.length === 0 ? (
                    <div className="page-state" style={{ padding: "20px 0" }}>
                      <Timer size={26} color="var(--muted)" />
                      No completed study sessions logged yet — mark sessions done in your Study Planner to see this chart fill in.
                    </div>
                  ) : (
                    <>
                      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, height: 160, marginBottom: 16 }}>
                        {last7.map((w, i) => {
                          const barH = Math.max(4, Math.round((w.minutes / maxMinutes) * 130));
                          const isHov = hovered === i;
                          return (
                            <div key={w.date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}
                              onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
                              {isHov && (
                                <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ink)", background: "var(--cream)",
                                  border: "1px solid var(--border)", borderRadius: 8, padding: "3px 8px", whiteSpace: "nowrap" }}>
                                  {w.minutes} min
                                </div>
                              )}
                              <div style={{
                                width: "100%", height: barH,
                                background: isHov ? "var(--gold)" : "linear-gradient(180deg,var(--teal-light),var(--teal))",
                                borderRadius: "8px 8px 4px 4px",
                                transition: "all 0.25s ease",
                                boxShadow: isHov ? "0 4px 16px rgba(201,146,42,0.4)" : "none",
                              }} />
                            </div>
                          );
                        })}
                      </div>
                      <div style={{ display: "flex", gap: 12 }}>
                        {last7.map((w) => (
                          <div key={w.date} style={{ flex: 1, textAlign: "center", fontSize: 12, fontWeight: 600, color: "var(--muted)" }}>
                            {fmtDate(w.date)}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Subject Performance */}
                <h2 className="page-section-title">Subject <span>Performance</span></h2>
                {subjects.length === 0 ? (
                  <div className="page-state" style={{ marginBottom: 40 }}>
                    Log chapter progress by subject to see a performance breakdown here.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                    {subjects.map((s) => {
                      const { icon: Icon, color, bg } = subjectStyle(s.subject);
                      return (
                        <div key={s.subject} style={{ background: "white", border: "1.5px solid var(--border)", borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 18 }}>
                          <div style={{ width: 46, height: 46, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={22} color={color} /></div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                              <span style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)" }}>{s.subject}</span>
                              <span style={{ fontWeight: 700, fontSize: 15, color: color }}>{s.average_completion}%</span>
                            </div>
                            <div style={{ height: 8, background: "var(--cream)", borderRadius: 10, overflow: "hidden" }}>
                              <div style={{ width: `${s.average_completion}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.6s ease" }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Recent Tests */}
                <h2 className="page-section-title">Recent <span>Tests</span></h2>
                {recentAttempts.length === 0 ? (
                  <div className="page-state">Take a mock test to see your results appear here.</div>
                ) : (
                  recentAttempts.map((r) => (
                    <div key={r.id} className="list-row" style={{ cursor: "default" }}>
                      <div className="list-row-icon" style={{ background: "var(--cream)" }}><ClipboardList size={18} color="var(--gold, #c9922a)" /></div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="list-row-title">{r.test_name}</div>
                        <div className="list-row-sub">{fmtDate(r.submitted_at)}</div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: 18, fontFamily: "var(--font-sans, 'Inter', sans-serif)", color: r.score >= 80 ? "#1e8449" : r.score >= 60 ? "#c9922a" : "#c0392b" }}>{r.score}%</div>
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>{r.score >= 80 ? "Excellent" : r.score >= 60 ? "Good" : "Needs Work"}</div>
                      </div>
                    </div>
                  ))
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
