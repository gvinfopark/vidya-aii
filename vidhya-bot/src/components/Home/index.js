import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PageLayout from "../Layout/PageLayout";
import SideNav from "../Layout/SideNav";
import {
  ClipboardList, BarChart3, Layers, Target, Sparkles, KeyRound, X,
  BookOpen, Award, Bell, Calendar, GraduationCap, Star, Trophy, Bookmark,
  AlertTriangle, Info, CheckCircle,
} from "lucide-react";
import { analytics as analyticsApi, progress as progressApi, studyPlans as studyPlansApi, GROQ_KEY_STORAGE, DEFAULT_GROQ_API_KEY } from "../../services/api";
import { subjectStyle } from "../pages/subjectStyle";
import { useSiteContent } from "../../context/SiteContentContext";

// Maps the icon name an admin picks in the dashboard to an actual component.
const ICON_MAP = {
  ClipboardList, BarChart3, Layers, Target, Sparkles, KeyRound,
  BookOpen, Award, Bell, Calendar, GraduationCap, Star, Trophy, Bookmark,
};

const BANNER_ICON = { info: Info, warning: AlertTriangle, success: CheckCircle };

export default function Home({ userName, onLogout }) {
  const navigate = useNavigate();
  const { siteContent } = useSiteContent();
  const { hero, banner, quick_access: quickAccess, sections } = siteContent;
  const [collapsed, setCollapsed] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [todaySessions, setTodaySessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [keyModalOpen, setKeyModalOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [keySavedMsg, setKeySavedMsg] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [dash, prog, plans] = await Promise.all([
        analyticsApi.dashboard().catch(() => null),
        progressApi.get().catch(() => null),
        studyPlansApi.list().catch(() => []),
      ]);
      setDashboard(dash);
      setChapters((prog?.chapters || []).slice(-4).reverse());
      const todayStr = new Date().toISOString().slice(0, 10);
      const todayPlan = plans.find((p) => p.date === todayStr) || plans[0];
      setTodaySessions(todayPlan?.sessions || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openKeyModal = () => {
    setKeyInput("");
    setKeySavedMsg("");
    setKeyModalOpen(true);
  };

  const saveKey = () => {
    const k = keyInput.replace(/[^\x20-\x7E]/g, "").trim();
    if (!k) return;
    localStorage.setItem(GROQ_KEY_STORAGE, k);
    setKeySavedMsg("Saved! VIDYA AI will use this key from now on.");
    setKeyInput("");
  };

  const resetKeyToDefault = () => {
    localStorage.setItem(GROQ_KEY_STORAGE, DEFAULT_GROQ_API_KEY);
    setKeySavedMsg("Reset to the default VIDYA AI key.");
  };

  const chaptersDone = chapters.filter((c) => c.completion >= 80).length;
  const avgScore = dashboard?.average_score ?? 0;
  const dayStreak = dashboard?.streak_days ?? 0;

  return (
    <PageLayout userName={userName}>
      <div className="flex w-full min-h-screen">
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="w-full max-w-full min-h-screen box-border overflow-x-hidden overflow-y-auto bg-bg flex-1">

          <section className="relative overflow-hidden bg-bg w-full box-border pb-10 before:content-[''] before:absolute before:inset-0 before:pointer-events-none before:[background:radial-gradient(circle_at_15%_20%,var(--c-accent-soft),transparent_35%)]">
            {sections?.show_banner && banner?.enabled && banner?.message && (
              <div className="w-full max-w-[1280px] mx-auto pt-5 box-border">
                {(() => {
                  const BIcon = BANNER_ICON[banner.type] || Info;
                  const tone = banner.type === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : banner.type === "success"
                    ? "bg-green-50 border-green-200 text-green-800"
                    : "bg-blue-50 border-blue-200 text-blue-800";
                  return (
                    <div className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium mb-2 ${tone}`}>
                      <BIcon size={16} className="shrink-0" />
                      <span>{banner.message}</span>
                    </div>
                  );
                })()}
              </div>
            )}
            <div className="w-full max-w-[1280px] mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] items-center gap-8 lg:gap-12 relative z-[1] box-border">
              <div className="min-w-0">
                <div className="inline-flex items-center gap-2 bg-accent-soft border border-border-strong rounded-[30px] px-4 py-1.5 mb-5 text-[11px] font-extrabold text-accent tracking-widest uppercase">
                  <Sparkles size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />{hero?.badge}
                </div>
                <h1 className="font-sans text-[30px] sm:text-[38px] lg:text-[50px] tracking-[-1.5px] text-text font-extrabold leading-[1.15] mb-4 break-words">
                  Hello, <span className="bg-accent bg-clip-text text-transparent">{userName}</span><br />{hero?.title_line1}{hero?.title_line2 ? ` ${hero.title_line2}` : ""}
                </h1>
                <p className="text-text-muted text-base leading-relaxed max-w-[560px] mb-7">{hero?.subtitle}</p>
                <div className="flex gap-3 flex-wrap flex-col sm:flex-row">
                  <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer font-sans transition-all whitespace-nowrap border-none bg-accent text-text-on-accent shadow-[0_6px_20px_var(--c-accent-soft-strong)] hover:-translate-y-0.5 hover:opacity-[0.93]" onClick={() => navigate('/neet')}>{hero?.cta_primary_text}</button>
                  <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer font-sans transition-all whitespace-nowrap bg-surface text-text border-[1.5px] border-border hover:-translate-y-0.5 hover:opacity-[0.93]" onClick={() => navigate('/mock-tests')}>{hero?.cta_secondary_text}</button>
                  <button className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-extrabold cursor-pointer font-sans transition-all whitespace-nowrap bg-surface text-text border-[1.5px] border-border hover:-translate-y-0.5 hover:opacity-[0.93] flex items-center justify-center gap-2" onClick={openKeyModal}>
                    <KeyRound size={16} /> Change API Key
                  </button>
                </div>
              </div>

              <div className="flex flex-row flex-wrap lg:flex-col justify-center gap-4 mt-5 w-full lg:w-auto">
                {[
                  [`${chaptersDone}`, "Chapters Mastered"],
                  [`${avgScore}%`, "Avg. Score"],
                  [`${dayStreak}`, "Day Streak"]
                ].map(([n, l]) => (
                  <div key={l} className="bg-surface border border-border rounded-2xl px-4 py-5 sm:px-7 text-center min-w-0 sm:min-w-[155px] flex-1 sm:flex-none shadow-token_sm transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_var(--c-accent-soft-strong)]">
                    <div className="font-sans text-[30px] font-black bg-accent bg-clip-text text-transparent">{n}</div>
                    <div className="text-text-muted text-xs mt-1 font-semibold">{l}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <div className="pt-5 pb-8 w-full box-border">
            {sections?.show_quick_access && (
              <>
                <div className="w-full max-w-[1280px] mx-auto mb-5 flex items-center justify-between box-border">
                  <h2 className="font-sans text-2xl sm:text-[30px] font-black text-text">Quick <span className="bg-accent bg-clip-text text-transparent">Access</span></h2>
                </div>
                <div className="w-full max-w-[1280px] mx-auto mb-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 box-border">
                  {(quickAccess || []).map(q => {
                    const Icon = ICON_MAP[q.icon] || Sparkles;
                    return (
                      <div key={q.title} className="bg-surface border border-border rounded-2xl p-5 cursor-pointer transition-all shadow-token_sm flex flex-col gap-2.5 hover:-translate-y-1 hover:shadow-[0_15px_35px_var(--c-accent-soft-strong)] hover:border-border-strong animate-fadeUp" onClick={() => navigate(q.path)}>
                        <div className="text-[28px]"><Icon size={22} /></div>
                        <div>
                          <div className="font-extrabold text-sm text-text">{q.title}</div>
                          <div className="text-xs text-text-muted leading-relaxed">{q.sub}</div>
                        </div>
                        <div className="mt-auto text-lg text-accent">›</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {(sections?.show_progress || sections?.show_schedule) && (
              <div className="w-full max-w-[1280px] mx-auto mb-5 flex items-center justify-between box-border">
                <h2 className="font-sans text-2xl sm:text-[30px] font-black text-text">Your <span className="bg-accent bg-clip-text text-transparent">Progress</span></h2>
                {sections?.show_progress && (
                  <button className="text-sm text-accent font-extrabold cursor-pointer bg-transparent border-none font-sans" onClick={() => navigate('/progress')}>Full Report →</button>
                )}
              </div>
            )}
            <div className={`w-full max-w-[1280px] mx-auto mb-12 grid grid-cols-1 gap-5 box-border ${sections?.show_progress && sections?.show_schedule ? "lg:grid-cols-[3fr_2fr]" : ""}`}>
              {sections?.show_progress && (
              <div className="bg-surface border border-border rounded-[20px] p-5 sm:p-7 shadow-token_sm box-border">
                <h3 className="font-sans text-xl font-black mb-5 text-text">Chapter Progress</h3>
                {loading && <div className="text-[13px] text-text-muted">Loading…</div>}
                {!loading && chapters.length === 0 && (
                  <div className="text-[13px] text-text-muted">
                    No chapters logged yet — add some in the <a className="text-accent-text" href="/progress" onClick={(e) => { e.preventDefault(); navigate('/progress'); }}>Progress</a> page.
                  </div>
                )}
                {chapters.map((c) => {
                  const { icon: Icon, color, bg } = subjectStyle(c.subject);
                  return (
                    <div key={c.id} className="flex items-center gap-3.5 py-3 border-b border-border last:border-b-0">
                      <div className="w-10 h-10 rounded-[11px] flex items-center justify-center text-base shrink-0" style={{ background: bg }}><Icon size={20} color={color} /></div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-extrabold text-text whitespace-nowrap overflow-hidden text-ellipsis">{c.chapter}</div>
                        <div className="text-[11px] text-text-muted mt-0.5">{c.subject}</div>
                        <div className="mt-1.5">
                          <div className="h-1.5 bg-bg-tertiary rounded-[10px] overflow-hidden">
                            <div className="h-full rounded-[10px] transition-[width] duration-500" style={{ width: `${c.completion}%`, background: color }} />
                          </div>
                          <div className="font-sans text-[11px] font-extrabold text-right mt-0.5" style={{ color: color }}>{c.completion}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              )}
              {sections?.show_schedule && (
              <div className="bg-surface border border-border rounded-[20px] p-5 sm:p-7 shadow-token_sm box-border">
                <h3 className="font-sans text-xl font-black mb-5 text-text">Today's Schedule</h3>
                {loading && <div className="text-[13px] text-text-muted">Loading…</div>}
                {!loading && todaySessions.length === 0 && (
                  <div className="text-[13px] text-text-muted">
                    Nothing planned yet — build a schedule in the <a className="text-accent-text" href="/study-planner" onClick={(e) => { e.preventDefault(); navigate('/study-planner'); }}>Study Planner</a>.
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  {todaySessions.map((s, i) => {
                    const { color } = subjectStyle(s.subject || "");
                    return (
                      <div key={s.id || i} className="flex gap-3 items-start px-3.5 py-3 rounded-xl bg-bg-secondary border border-border transition-all hover:bg-bg-tertiary hover:border-accent-soft-strong">
                        <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: s.completed ? "#1e8449" : color }} />
                        <div className="flex-1">
                          <div className="font-sans text-[11px] font-black text-accent min-w-[42px]">{s.start_time || "—"}</div>
                          <div className="text-xs font-extrabold text-text">{s.title}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{s.subject || ""}{s.duration_minutes ? ` · ${s.duration_minutes} min` : ""}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {keyModalOpen && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center bg-[rgba(20,18,12,0.45)] p-4"
          onClick={() => setKeyModalOpen(false)}
        >
          <div
            className="w-full max-w-[420px] bg-surface border border-border rounded-token_lg shadow-token_lg p-6 flex flex-col gap-3.5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-sans text-lg font-bold text-text">
                <KeyRound size={18} /> VIDYA AI — API Key
              </div>
              <button className="bg-transparent border-none text-text-muted cursor-pointer" onClick={() => setKeyModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p className="text-[13px] text-text-muted leading-relaxed">
              A working key is already set up for you. Paste a new Groq API key below to switch it, or reset to the default any time.
            </p>
            <input
              className="w-full px-3.5 py-3 rounded-[10px] border border-border bg-bg text-[14px] text-text font-sans outline-none focus:border-accent"
              type="password"
              placeholder="Paste your Groq API key here (gsk_...)…"
              value={keyInput}
              onChange={(e) => setKeyInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") saveKey(); }}
              autoFocus
            />
            {keySavedMsg && <div className="text-[12.5px] text-success font-semibold">{keySavedMsg}</div>}
            <div className="flex gap-2.5 flex-col sm:flex-row">
              <button className="flex-1 py-3 rounded-[10px] bg-primary text-primary-text text-sm font-bold border-none cursor-pointer hover:enabled:bg-primary-hover disabled:opacity-60" onClick={saveKey} disabled={!keyInput.trim()}>
                Save Key
              </button>
              <button className="flex-1 py-3 rounded-[10px] bg-surface border border-border text-text text-sm font-semibold cursor-pointer hover:bg-bg-tertiary" onClick={resetKeyToDefault}>
                Reset to Default
              </button>
            </div>
            <p className="text-[11px] text-text-faint text-center">Your key is stored locally in this browser only.</p>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
