import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Target, Lightbulb, Plus, Trash2 } from "lucide-react";
import { studyPlans as studyPlansApi } from "../../../services/api";
import { fmtDate } from "../subjectStyle";
import "../page.css";

const SESSION_COLORS = ["#1a5276", "#1e8449", "#c9922a", "#7d3c98", "#c0392b"];

export default function StudyPlanner({ userName, onLogout }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: "", date: new Date().toISOString().slice(0, 10),
    sessionTitle: "", sessionSubject: "", startTime: "", duration: 60,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await studyPlansApi.list();
      setPlans(data);
    } catch (err) {
      setError(err.message || "Could not load your study plan");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (activeIdx >= plans.length) setActiveIdx(0); }, [plans, activeIdx]);

  const activePlan = plans[activeIdx];
  const sessions = activePlan?.sessions || [];
  const dayDone = sessions.filter((s) => s.completed).length;
  const dayTotal = sessions.length;
  const pct = dayTotal ? Math.round((dayDone / dayTotal) * 100) : 0;

  const toggle = async (sessionId) => {
    if (!activePlan) return;
    try {
      const updated = await studyPlansApi.toggleSession(activePlan.id, sessionId);
      setPlans((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    } catch (err) {
      setError(err.message || "Could not update session");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.date || !form.sessionTitle.trim()) return;
    setSaving(true);
    try {
      await studyPlansApi.create({
        title: form.title,
        date: form.date,
        sessions: [{
          title: form.sessionTitle,
          subject: form.sessionSubject || null,
          start_time: form.startTime || null,
          duration_minutes: Number(form.duration) || 60,
          completed: false,
        }],
      });
      setForm({ title: "", date: new Date().toISOString().slice(0, 10), sessionTitle: "", sessionSubject: "", startTime: "", duration: 60 });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not create study plan");
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId) => {
    if (!window.confirm("Delete this day's plan?")) return;
    try {
      await studyPlansApi.remove(planId);
      await load();
    } catch (err) {
      setError(err.message || "Could not delete plan");
    }
  };

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="page-wrap">
            <div className="page-hero" style={{ background: "linear-gradient(135deg,#2a1a0d,#c9922a)" }}>
              <div className="page-hero-badge"><Target size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Study Planner</div>
              <h1>Your Schedule</h1>
              <p>Your own study plan, saved to your account. Add sessions and track what you complete.</p>
              <div className="page-hero-meta">
                {[[`${plans.length}`, "Planned Days"], [`${dayDone}/${dayTotal || 0}`, "Today's Progress"]].map(([n, l]) => (
                  <div key={l} className="page-hero-stat">
                    <div className="page-hero-stat-num">{n}</div>
                    <div className="page-hero-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <h2 className="page-section-title" style={{ marginBottom: 0 }}>Study <span>Plan</span></h2>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 16px" }}
                onClick={() => setShowForm((s) => !s)}>
                <Plus size={16} /> {showForm ? "Cancel" : "Add Session"}
              </button>
            </div>

            {showForm && (
              <form className="page-form" onSubmit={handleCreate}>
                <div className="page-form-field">
                  <label>Plan Title</label>
                  <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="e.g. NEET Revision" required />
                </div>
                <div className="page-form-field">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
                </div>
                <div className="page-form-field">
                  <label>Session</label>
                  <input value={form.sessionTitle} onChange={(e) => setForm((f) => ({ ...f, sessionTitle: e.target.value }))} placeholder="e.g. Physics – Mechanics" required />
                </div>
                <div className="page-form-field">
                  <label>Subject</label>
                  <input value={form.sessionSubject} onChange={(e) => setForm((f) => ({ ...f, sessionSubject: e.target.value }))} placeholder="e.g. Physics" />
                </div>
                <div className="page-form-field" style={{ minWidth: 100 }}>
                  <label>Start Time</label>
                  <input value={form.startTime} onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))} placeholder="9:00 AM" />
                </div>
                <div className="page-form-field" style={{ minWidth: 100 }}>
                  <label>Minutes</label>
                  <input type="number" min="5" value={form.duration} onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))} />
                </div>
                <button className="btn-primary" type="submit" disabled={saving} style={{ fontSize: 13, padding: "10px 18px" }}>
                  {saving ? "Saving…" : "Save"}
                </button>
              </form>
            )}

            {loading && <div className="page-state"><div className="page-state-spinner" />Loading your plan…</div>}
            {!loading && error && <div className="page-state page-state-error">{error}</div>}

            {!loading && !error && plans.length === 0 && (
              <div className="page-state">
                <Target size={32} color="var(--muted)" />
                No study sessions planned yet — add one above to build your schedule.
              </div>
            )}

            {!loading && !error && plans.length > 0 && (
              <>
                <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 4 }}>
                  {plans.map((p, i) => (
                    <button key={p.id} onClick={() => setActiveIdx(i)} style={{
                      padding: "10px 20px", borderRadius: 12, border: "1.5px solid",
                      borderColor: activeIdx === i ? "var(--gold)" : "var(--border)",
                      background: activeIdx === i ? "var(--gold)" : "white",
                      color: activeIdx === i ? "white" : "var(--slate)",
                      fontSize: 14, fontWeight: 700, cursor: "pointer",
                      fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                      flexShrink: 0,
                      boxShadow: activeIdx === i ? "0 4px 16px rgba(201,146,42,0.3)" : "none",
                    }}>
                      {p.title}
                      <span style={{ display: "block", fontSize: 10, opacity: 0.8 }}>{fmtDate(p.date)}</span>
                    </button>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24 }}>
                  <div style={{ flex: 1, height: 8, background: "var(--cream)", borderRadius: 10, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: "var(--gold)", borderRadius: 10, transition: "width 0.4s" }} />
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--gold)", minWidth: 80 }}>
                    {dayDone}/{dayTotal} done
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 className="page-section-title" style={{ marginBottom: 0 }}>{activePlan?.title}'s <span>Sessions</span></h2>
                  {activePlan && (
                    <button onClick={() => handleDeletePlan(activePlan.id)} title="Delete this plan"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)" }}>
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 40 }}>
                  {sessions.map((s, i) => {
                    const color = SESSION_COLORS[i % SESSION_COLORS.length];
                    return (
                      <div key={s.id || i} style={{
                        display: "flex", gap: 16, alignItems: "center",
                        padding: "18px 22px",
                        background: s.completed ? "#f0faf8" : "white",
                        border: `1.5px solid ${s.completed ? "#1e8449" : "var(--border)"}`,
                        borderRadius: 16,
                        borderLeft: `4px solid ${s.completed ? "#1e8449" : color}`,
                        transition: "all 0.25s",
                        opacity: s.completed ? 0.8 : 1,
                      }}>
                        <div style={{ textAlign: "center", minWidth: 70 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: s.completed ? "#1e8449" : color }}>{s.start_time || "—"}</div>
                          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>{s.duration_minutes} min</div>
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 15, color: "var(--ink)", textDecoration: s.completed ? "line-through" : "none" }}>{s.title}</div>
                          {s.subject && <div style={{ fontSize: 12, color: "var(--muted)" }}>{s.subject}</div>}
                        </div>
                        <button
                          onClick={() => toggle(s.id)}
                          style={{
                            padding: "8px 16px", borderRadius: 10,
                            border: s.completed ? "1.5px solid #1e8449" : "1.5px solid var(--border)",
                            background: s.completed ? "#d5f5e3" : "white",
                            color: s.completed ? "#1e8449" : "var(--slate)",
                            fontWeight: 700, fontSize: 12, cursor: "pointer",
                            fontFamily: "'DM Sans',sans-serif", transition: "all 0.2s",
                            flexShrink: 0,
                          }}
                        >
                          {s.completed ? "✓ Done" : "Mark Done"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            <div style={{ background: "var(--cream)", border: "1.5px solid var(--border)", borderRadius: 16, padding: "22px 26px", display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "center" }}><Lightbulb size={30} color="var(--gold, #c9922a)" /></div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "var(--ink)", marginBottom: 4 }}>Tip of the Day</div>
                <div style={{ fontSize: 13, color: "var(--slate)" }}>
                  Review your weakest chapter for just 20 minutes before bed — spaced repetition boosts long-term memory by up to 40%.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
