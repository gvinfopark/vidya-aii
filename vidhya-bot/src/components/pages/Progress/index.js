import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Trophy, Flame, Star, Target, TrendingUp, Plus } from "lucide-react";
import { progress as progressApi } from "../../../services/api";
import { subjectStyle } from "../subjectStyle";
import "../page.css";

function buildMilestones(chapters, streakDays) {
  const mastered = chapters.filter((c) => c.completion >= 80).length;
  return [
    { icon: Flame, title: "7-Day Streak", done: streakDays >= 7, sub: streakDays >= 7 ? `${streakDays} day streak` : `${streakDays}/7 days so far` },
    { icon: Star, title: "First Chapter 80%+", done: mastered >= 1, sub: mastered >= 1 ? `${mastered} chapter(s) mastered` : "Not yet reached" },
    { icon: Trophy, title: "5 Chapters Mastered", done: mastered >= 5, sub: mastered >= 5 ? "Achieved!" : `${mastered}/5 chapters` },
    { icon: Target, title: "30-Day Streak", done: streakDays >= 30, sub: streakDays >= 30 ? "Achieved!" : `${streakDays}/30 days` },
  ];
}

export default function Progress({ userName, onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ subject: "", chapter: "", completion: 50 });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const d = await progressApi.get();
      setData(d);
    } catch (err) {
      setError(err.message || "Could not load your progress");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const chapters = data?.chapters || [];
  const streakDays = data?.streak_days || 0;
  const avgPct = chapters.length ? Math.round(chapters.reduce((s, c) => s + c.completion, 0) / chapters.length) : 0;
  const done = chapters.filter((c) => c.completion >= 80).length;
  const milestones = buildMilestones(chapters, streakDays);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.chapter.trim()) return;
    setSaving(true);
    try {
      await progressApi.addChapter({ subject: form.subject, chapter: form.chapter, completion: Number(form.completion) });
      setForm({ subject: "", chapter: "", completion: 50 });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not add chapter");
    } finally {
      setSaving(false);
    }
  };

  const bumpStreak = async (increment) => {
    try {
      await progressApi.updateStreak({ increment });
      await load();
    } catch (err) {
      setError(err.message || "Could not update streak");
    }
  };

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="page-wrap">
            <div className="page-hero" style={{ background: "linear-gradient(135deg,#1a2a0d,#2e7d32)" }}>
              <div className="page-hero-badge"><TrendingUp size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Your Journey</div>
              <h1>Progress Report</h1>
              <p>A complete picture of your learning journey — chapters mastered, streak, and what's next.</p>
              <div className="page-hero-meta">
                {[[`${avgPct}%`, "Avg Completion"], [`${done}/${chapters.length}`, "Chapters Mastered"], [`${streakDays}`, "Day Streak"]].map(([n, l]) => (
                  <div key={l} className="page-hero-stat">
                    <div className="page-hero-stat-num">{n}</div>
                    <div className="page-hero-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            {loading && <div className="page-state"><div className="page-state-spinner" />Loading your progress…</div>}
            {!loading && error && <div className="page-state page-state-error">{error}</div>}

            {!loading && !error && (
              <>
                {/* Overall ring */}
                <div style={{ background: "white", border: "1.5px solid var(--border)", borderRadius: 20, padding: "32px", marginBottom: 36, display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap" }}>
                  <div style={{ position: "relative", width: 120, height: 120, flexShrink: 0 }}>
                    <svg viewBox="0 0 120 120" width="120" height="120">
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--cream)" strokeWidth="12" />
                      <circle cx="60" cy="60" r="50" fill="none" stroke="var(--teal)" strokeWidth="12"
                        strokeDasharray={`${2 * Math.PI * 50 * avgPct / 100} ${2 * Math.PI * 50 * (1 - avgPct / 100)}`}
                        strokeLinecap="round"
                        transform="rotate(-90 60 60)"
                      />
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <div style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)", fontSize: 24, fontWeight: 800, color: "var(--ink)" }}>{avgPct}%</div>
                      <div style={{ fontSize: 10, color: "var(--muted)", fontWeight: 500 }}>Overall</div>
                    </div>
                  </div>
                  <div style={{ flex: 1, minWidth: 220 }}>
                    <div style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)", fontSize: 22, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Overall Progress</div>
                    <div style={{ fontSize: 14, color: "var(--slate)", lineHeight: 1.7 }}>
                      {chapters.length === 0
                        ? "You haven't logged any chapters yet — add your first below."
                        : <>You've mastered <b>{done}</b> of <b>{chapters.length}</b> chapters. Keep the streak alive! <Flame size={15} color="#c9922a" style={{ verticalAlign: "-2px" }} /></>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      <button className="btn-outline" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => bumpStreak(true)}>+1 Streak Day</button>
                      <button className="btn-outline" style={{ fontSize: 12, padding: "6px 14px" }} onClick={() => bumpStreak(false)}>-1 Streak Day</button>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 className="page-section-title" style={{ marginBottom: 0 }}>Chapter <span>Breakdown</span></h2>
                  <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 16px" }}
                    onClick={() => setShowForm((s) => !s)}>
                    <Plus size={16} /> {showForm ? "Cancel" : "Add Chapter"}
                  </button>
                </div>

                {showForm && (
                  <form className="page-form" onSubmit={handleCreate}>
                    <div className="page-form-field">
                      <label>Subject</label>
                      <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. Biology XI" required />
                    </div>
                    <div className="page-form-field">
                      <label>Chapter</label>
                      <input value={form.chapter} onChange={(e) => setForm((f) => ({ ...f, chapter: e.target.value }))} placeholder="e.g. Cell: The Unit of Life" required />
                    </div>
                    <div className="page-form-field" style={{ minWidth: 100 }}>
                      <label>Completion %</label>
                      <input type="number" min="0" max="100" value={form.completion} onChange={(e) => setForm((f) => ({ ...f, completion: e.target.value }))} />
                    </div>
                    <button className="btn-primary" type="submit" disabled={saving} style={{ fontSize: 13, padding: "10px 18px" }}>
                      {saving ? "Saving…" : "Save"}
                    </button>
                  </form>
                )}

                {chapters.length === 0 && (
                  <div className="page-state">No chapters logged yet — add one above to start tracking.</div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
                  {[...chapters].sort((a, b) => b.completion - a.completion).map((c) => {
                    const { icon: Icon, color, bg } = subjectStyle(c.subject);
                    return (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", background: "white", border: "1.5px solid var(--border)", borderRadius: 14 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 10, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={18} color={color} /></div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.chapter}</div>
                          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 6 }}>{c.subject}</div>
                          <div style={{ height: 6, background: "var(--cream)", borderRadius: 10, overflow: "hidden" }}>
                            <div style={{ width: `${c.completion}%`, height: "100%", background: color, borderRadius: 10, transition: "width 0.6s ease" }} />
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: 16, color: color, minWidth: 40, textAlign: "right" }}>{c.completion}%</div>
                      </div>
                    );
                  })}
                </div>

                <h2 className="page-section-title">Milestones <span>& Goals</span></h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {milestones.map((m, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 22px", background: m.done ? "var(--cream)" : "white", border: "1.5px solid var(--border)", borderRadius: 14, opacity: m.done ? 1 : 0.75 }}>
                      <div style={{ display: "flex", alignItems: "center" }}><m.icon size={24} color={m.done ? "#1e8449" : "#c9922a"} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, color: "var(--ink)", textDecoration: m.done ? "line-through" : "none" }}>{m.title}</div>
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>{m.sub}</div>
                      </div>
                      <div style={{ padding: "4px 14px", borderRadius: 20, fontSize: 12, fontWeight: 700, background: m.done ? "#d5f5e3" : "#fdebd0", color: m.done ? "#1e8449" : "#c9922a" }}>
                        {m.done ? "✓ Done" : "Upcoming"}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
