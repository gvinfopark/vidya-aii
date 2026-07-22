import React, { useEffect, useState } from "react";
import { Plus, Trash2, Save, RotateCcw } from "lucide-react";
import { content as contentApi } from "../../../services/api";
import { useSiteContent } from "../../../context/SiteContentContext";
import { cardCls, inputCls, textareaCls, labelCls, primaryBtnCls, secondaryBtnCls, iconBtnCls } from "../adminStyles";

const ICON_CHOICES = [
  "ClipboardList", "BarChart3", "Layers", "Target", "Sparkles", "KeyRound",
  "BookOpen", "Award", "Bell", "Calendar", "GraduationCap", "Star", "Trophy", "Bookmark",
];

export default function SiteContentTab() {
  const { siteContent, refresh } = useSiteContent();
  const [form, setForm] = useState(siteContent);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => { setForm(siteContent); }, [siteContent]);

  const setHero = (field, value) => setForm(f => ({ ...f, hero: { ...f.hero, [field]: value } }));
  const setBanner = (field, value) => setForm(f => ({ ...f, banner: { ...f.banner, [field]: value } }));
  const setSection = (field, value) => setForm(f => ({ ...f, sections: { ...f.sections, [field]: value } }));
  const setTheme = (field, value) => setForm(f => ({ ...f, theme: { ...f.theme, [field]: value } }));

  const setQuickItem = (i, field, value) => setForm(f => ({
    ...f,
    quick_access: f.quick_access.map((q, idx) => idx === i ? { ...q, [field]: value } : q),
  }));
  const addQuickItem = () => setForm(f => ({
    ...f,
    quick_access: [...(f.quick_access || []), { icon: "Sparkles", title: "New Card", sub: "", path: "/home" }],
  }));
  const removeQuickItem = (i) => setForm(f => ({
    ...f,
    quick_access: f.quick_access.filter((_, idx) => idx !== i),
  }));

  const save = async () => {
    setSaving(true);
    setErr("");
    setSavedMsg("");
    try {
      await contentApi.update({
        hero: form.hero,
        banner: form.banner,
        sections: form.sections,
        theme: form.theme,
        quick_access: form.quick_access,
      });
      await refresh();
      setSavedMsg("Saved — changes are live on the site now.");
    } catch (e) {
      setErr(e.message || "Failed to save site content.");
    } finally {
      setSaving(false);
    }
  };

  const resetDefaults = () => setForm(siteContent);

  if (!form) return null;

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 max-w-[900px]">
      {err && <div className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2.5">{err}</div>}
      {savedMsg && <div className="text-success text-sm bg-green-50 border border-green-200 rounded-lg px-4 py-2.5">{savedMsg}</div>}

      {/* Hero */}
      <div className={cardCls}>
        <h3 className="font-black text-lg text-text mb-4">Home Hero Section</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className={labelCls}>Badge text</label>
            <input className={inputCls} value={form.hero?.badge || ""} onChange={e => setHero("badge", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Headline (line after student's name)</label>
            <input className={inputCls} value={form.hero?.title_line1 || ""} onChange={e => setHero("title_line1", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Headline — extra text (optional)</label>
            <input className={inputCls} value={form.hero?.title_line2 || ""} onChange={e => setHero("title_line2", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>Subtitle</label>
            <textarea className={textareaCls} value={form.hero?.subtitle || ""} onChange={e => setHero("subtitle", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Primary button text</label>
            <input className={inputCls} value={form.hero?.cta_primary_text || ""} onChange={e => setHero("cta_primary_text", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>Secondary button text</label>
            <input className={inputCls} value={form.hero?.cta_secondary_text || ""} onChange={e => setHero("cta_secondary_text", e.target.value)} />
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className={cardCls}>
        <h3 className="font-black text-lg text-text mb-4">Announcement Banner</h3>
        <div className="flex flex-col gap-4">
          <label className="flex items-center gap-2.5 text-sm font-semibold text-text cursor-pointer">
            <input type="checkbox" checked={!!form.sections?.show_banner} onChange={e => setSection("show_banner", e.target.checked)} />
            Show banner on the Home page
          </label>
          <div>
            <label className={labelCls}>Message</label>
            <input className={inputCls} value={form.banner?.message || ""} onChange={e => setBanner("message", e.target.value)} placeholder="e.g. Mock test window closes Friday 6pm" />
          </div>
          <div>
            <label className={labelCls}>Type</label>
            <select className={inputCls} value={form.banner?.type || "info"} onChange={e => setBanner("type", e.target.value)}>
              <option value="info">Info (blue)</option>
              <option value="success">Success (green)</option>
              <option value="warning">Warning (amber)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Section toggles */}
      <div className={cardCls}>
        <h3 className="font-black text-lg text-text mb-4">Home Page Sections</h3>
        <div className="flex flex-col gap-3">
          {[
            ["show_quick_access", "Quick Access cards"],
            ["show_progress", "Chapter Progress panel"],
            ["show_schedule", "Today's Schedule panel"],
          ].map(([key, label]) => (
            <label key={key} className="flex items-center gap-2.5 text-sm font-semibold text-text cursor-pointer">
              <input type="checkbox" checked={!!form.sections?.[key]} onChange={e => setSection(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </div>

      {/* Quick access cards */}
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-lg text-text">Quick Access Cards</h3>
          <button className={`${iconBtnCls} bg-accent-soft text-accent`} title="Add card" onClick={addQuickItem}><Plus size={16} /></button>
        </div>
        <div className="flex flex-col gap-4">
          {(form.quick_access || []).map((q, i) => (
            <div key={i} className="grid grid-cols-1 sm:grid-cols-[110px_1fr_1fr_1fr_auto] gap-2.5 items-center border border-border rounded-xl p-3">
              <select className={inputCls} value={q.icon} onChange={e => setQuickItem(i, "icon", e.target.value)}>
                {ICON_CHOICES.map(ic => <option key={ic} value={ic}>{ic}</option>)}
              </select>
              <input className={inputCls} placeholder="Title" value={q.title} onChange={e => setQuickItem(i, "title", e.target.value)} />
              <input className={inputCls} placeholder="Subtitle" value={q.sub} onChange={e => setQuickItem(i, "sub", e.target.value)} />
              <input className={inputCls} placeholder="/path" value={q.path} onChange={e => setQuickItem(i, "path", e.target.value)} />
              <button className={`${iconBtnCls} bg-red-100 text-red-600`} title="Remove" onClick={() => removeQuickItem(i)}><Trash2 size={14} /></button>
            </div>
          ))}
          {(form.quick_access || []).length === 0 && <div className="text-[13px] text-text-muted">No cards — add one above.</div>}
        </div>
      </div>

      {/* Theme */}
      <div className={cardCls}>
        <h3 className="font-black text-lg text-text mb-4">Theme Colors</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Accent color</label>
            <div className="flex items-center gap-2.5">
              <input type="color" className="w-10 h-10 rounded border border-border cursor-pointer" value={form.theme?.accent || "#10A37F"} onChange={e => setTheme("accent", e.target.value)} />
              <input className={inputCls} value={form.theme?.accent || ""} onChange={e => setTheme("accent", e.target.value)} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Primary (button/text) color</label>
            <div className="flex items-center gap-2.5">
              <input type="color" className="w-10 h-10 rounded border border-border cursor-pointer" value={form.theme?.primary || "#0D0D0D"} onChange={e => setTheme("primary", e.target.value)} />
              <input className={inputCls} value={form.theme?.primary || ""} onChange={e => setTheme("primary", e.target.value)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3 sticky bottom-0 bg-surface pt-2 pb-1">
        <button className={primaryBtnCls} disabled={saving} onClick={save}><Save size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />{saving ? "Saving…" : "Save Changes"}</button>
        <button className={secondaryBtnCls} onClick={resetDefaults}><RotateCcw size={15} style={{ verticalAlign: "-2px", marginRight: 6 }} />Discard Edits</button>
      </div>
    </div>
  );
}
