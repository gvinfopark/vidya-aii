import React, { useEffect, useState } from "react";
import { Pencil, Check, XCircle, Trash2 } from "lucide-react";
import { admin } from "../../../services/api";
import { thCls, tdCls, iconBtnCls, editInputCls } from "../adminStyles";

export default function FlashcardsTab() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ subject: "", topic: "", question: "", answer: "" });
  const [savingId, setSavingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setCards(await admin.listFlashcards());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (c) => {
    setEditingId(c.id);
    setDraft({ subject: c.subject || "", topic: c.topic || "", question: c.question || "", answer: c.answer || "" });
  };

  const save = async (id) => {
    setSavingId(id);
    try {
      const updated = await admin.updateFlashcard(id, draft);
      setCards(cards.map(c => c.id === id ? { ...c, ...updated } : c));
      setEditingId(null);
    } catch (e) {
      alert(e.message || "Failed to update flashcard.");
    } finally {
      setSavingId(null);
    }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this flashcard?")) return;
    try {
      await admin.deleteFlashcard(id);
      setCards(cards.filter(c => c.id !== id));
    } catch (e) {
      alert(e.message || "Failed to delete flashcard.");
    }
  };

  return (
    <div className="p-4 sm:p-6">
      {error && <div className="text-red-600 text-sm mb-3">{error}</div>}
      {loading && <p className="text-text-muted">Loading flashcards…</p>}
      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[640px]">
          <thead>
            <tr><th className={thCls}>Subject</th><th className={thCls}>Topic</th><th className={thCls}>Question</th><th className={thCls}>Answer</th><th className={thCls}>Actions</th></tr>
          </thead>
          <tbody>
            {cards.map(c => {
              const isEditing = editingId === c.id;
              return (
                <tr key={c.id} className="hover:bg-bg-secondary">
                  <td className={tdCls}>{isEditing ? <input className={editInputCls} value={draft.subject} onChange={e => setDraft(d => ({ ...d, subject: e.target.value }))} /> : c.subject}</td>
                  <td className={tdCls}>{isEditing ? <input className={editInputCls} value={draft.topic} onChange={e => setDraft(d => ({ ...d, topic: e.target.value }))} /> : (c.topic || "—")}</td>
                  <td className={tdCls}>{isEditing ? <input className={`${editInputCls} max-w-none`} value={draft.question} onChange={e => setDraft(d => ({ ...d, question: e.target.value }))} /> : c.question}</td>
                  <td className={tdCls}>{isEditing ? <input className={`${editInputCls} max-w-none`} value={draft.answer} onChange={e => setDraft(d => ({ ...d, answer: e.target.value }))} /> : c.answer}</td>
                  <td className={`${tdCls} flex gap-2 flex-wrap`}>
                    {isEditing ? (
                      <>
                        <button className={`${iconBtnCls} bg-green-100 text-green-700`} title="Save" disabled={savingId === c.id} onClick={() => save(c.id)}><Check size={14} /></button>
                        <button className={`${iconBtnCls} bg-bg-tertiary text-text-muted`} title="Cancel" onClick={() => setEditingId(null)}><XCircle size={14} /></button>
                      </>
                    ) : (
                      <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title="Edit" onClick={() => startEdit(c)}><Pencil size={14} /></button>
                    )}
                    <button className={`${iconBtnCls} bg-red-100 text-red-600`} title="Delete" onClick={() => remove(c.id)}><Trash2 size={14} /></button>
                  </td>
                </tr>
              );
            })}
            {!loading && cards.length === 0 && <tr><td className={tdCls} colSpan={5}>No flashcards found in database.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
