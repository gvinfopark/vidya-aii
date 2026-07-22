import React, { useEffect, useState } from "react";
import { Pencil, Check, XCircle, Trash2 } from "lucide-react";
import { admin } from "../../../services/api";
import { thCls, tdCls, iconBtnCls, editInputCls } from "../adminStyles";

export default function StudyPlansTab() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: "", date: "" });
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setPlans(await admin.listStudyPlans());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (p) => {
    setEditingId(p.id);
    setDraft({ title: p.title || "", date: p.date || "" });
  };

  const save = async (id) => {
    setSavingId(id);
    try {
      const updated = await admin.updateStudyPlan(id, draft);
      setPlans(plans.map(p => p.id === id ? { ...p, ...updated } : p));
      setEditingId(null);
    } catch (e) {
      alert(e.message || "Failed to update study plan.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this study plan?")) return;
    try {
      await admin.deleteStudyPlan(id);
      setPlans(plans.filter(p => p.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete study plan.");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {loading && <p className="text-text-muted">Loading study plans…</p>}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr><th className={thCls}>Title</th><th className={thCls}>Date</th><th className={thCls}>Sessions</th><th className={thCls}>Actions</th></tr>
          </thead>
          <tbody>
            {plans.map(p => {
              const isEditing = editingId === p.id;
              return (
                <tr key={p.id} className="hover:bg-bg-secondary">
                  <td className={tdCls}>{isEditing ? <input className={editInputCls} value={draft.title} onChange={e => setDraft(d => ({ ...d, title: e.target.value }))} /> : <strong>{p.title}</strong>}</td>
                  <td className={tdCls}>{isEditing ? <input type="date" className={editInputCls} value={draft.date} onChange={e => setDraft(d => ({ ...d, date: e.target.value }))} /> : p.date}</td>
                  <td className={tdCls}>{(p.sessions || []).length}</td>
                  <td className={`${tdCls} flex gap-2 flex-wrap`}>
                    {isEditing ? (
                      <>
                        <button className={`${iconBtnCls} bg-green-100 text-green-700`} title="Save" disabled={savingId === p.id} onClick={() => save(p.id)}><Check size={14} /></button>
                        <button className={`${iconBtnCls} bg-bg-tertiary text-text-muted`} title="Cancel" onClick={() => setEditingId(null)}><XCircle size={14} /></button>
                      </>
                    ) : (
                      <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title="Edit" onClick={() => startEdit(p)}><Pencil size={14} /></button>
                    )}
                    <button className={`${iconBtnCls} bg-red-100 text-red-600`} title="Delete" onClick={() => remove(p.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {!loading && plans.length === 0 && <tr><td className={tdCls} colSpan={4}>No study plans found in database.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
