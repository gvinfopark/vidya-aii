import React, { useEffect, useState } from "react";
import { Plus, Trash2, Pencil, Check, XCircle, ChevronUp } from "lucide-react";
import { admin } from "../../../services/api";
import { thCls, tdCls, iconBtnCls, inputCls, labelCls, primaryBtnCls, secondaryBtnCls, cardCls } from "../adminStyles";

const emptyQuestion = () => ({ text: "", options: ["", "", "", ""], correct_answer: "" });
const emptyTest = () => ({ title: "", exam_type: "NEET", duration_minutes: 60, questions: [emptyQuestion()] });

function QuestionEditor({ questions, setQuestions }) {
  const update = (i, field, value) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: value } : q));
  const updateOption = (i, oi, value) => setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, options: q.options.map((o, oidx) => oidx === oi ? value : o) } : q));
  const addQuestion = () => setQuestions(qs => [...qs, emptyQuestion()]);
  const removeQuestion = (i) => setQuestions(qs => qs.filter((_, idx) => idx !== i));

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q, i) => (
        <div key={i} className="border border-border rounded-xl p-3.5">
          <div className="flex items-start gap-2.5 mb-2.5">
            <input className={inputCls} placeholder={`Question ${i + 1}`} value={q.text} onChange={e => update(i, "text", e.target.value)} />
            <button className={`${iconBtnCls} bg-red-100 text-red-600 shrink-0`} title="Remove question" onClick={() => removeQuestion(i)}><Trash2 size={14} /></button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {q.options.map((opt, oi) => (
              <input key={oi} className={inputCls} placeholder={`Option ${oi + 1}`} value={opt} onChange={e => updateOption(i, oi, e.target.value)} />
            ))}
          </div>
          <div className="mt-2">
            <label className={labelCls}>Correct answer (must match an option exactly)</label>
            <input className={inputCls} value={q.correct_answer} onChange={e => update(i, "correct_answer", e.target.value)} />
          </div>
        </div>
      ))}
      <button className={`${secondaryBtnCls} self-start`} onClick={addQuestion}><Plus size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />Add Question</button>
    </div>
  );
}

export default function MockTestsTab() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTest, setNewTest] = useState(emptyTest());
  const [expandedId, setExpandedId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setTests(await admin.listMockTests());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const createTest = async () => {
    if (!newTest.title.trim()) return;
    setSaving(true);
    try {
      await admin.createMockTest(newTest);
      setNewTest(emptyTest());
      setCreating(false);
      await load();
    } catch (e) {
      alert(e.message || "Failed to create test.");
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (test) => {
    setExpandedId(test.id);
    setEditDraft({ title: test.title, exam_type: test.exam_type, duration_minutes: test.duration_minutes, questions: test.questions || [] });
  };

  const saveEdit = async (testId) => {
    setSaving(true);
    try {
      await admin.updateMockTest(testId, editDraft);
      setExpandedId(null);
      setEditDraft(null);
      await load();
    } catch (e) {
      alert(e.message || "Failed to save test.");
    } finally {
      setSaving(false);
    }
  };

  const deleteTest = async (testId) => {
    if (!window.confirm("Delete this mock test permanently?")) return;
    try {
      await admin.deleteMockTest(testId);
      setTests(tests.filter(t => t.id !== testId));
    } catch (e) {
      alert(e.message || "Failed to delete test.");
    }
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {error && <div className="text-red-600 text-sm">{error}</div>}

      <div className="flex justify-between items-center">
        <h3 className="font-black text-lg text-text">Mock Test Question Bank</h3>
        <button className={primaryBtnCls} onClick={() => setCreating(v => !v)}>
          <Plus size={15} style={{ verticalAlign: "-2px", marginRight: 5 }} />{creating ? "Cancel" : "New Mock Test"}
        </button>
      </div>

      {creating && (
        <div className={cardCls}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
            <div>
              <label className={labelCls}>Title</label>
              <input className={inputCls} value={newTest.title} onChange={e => setNewTest(t => ({ ...t, title: e.target.value }))} />
            </div>
            <div>
              <label className={labelCls}>Exam type</label>
              <select className={inputCls} value={newTest.exam_type} onChange={e => setNewTest(t => ({ ...t, exam_type: e.target.value }))}>
                <option value="NEET">NEET</option>
                <option value="JEE">JEE</option>
                <option value="State Board">State Board</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Duration (minutes)</label>
              <input type="number" className={inputCls} value={newTest.duration_minutes} onChange={e => setNewTest(t => ({ ...t, duration_minutes: Number(e.target.value) }))} />
            </div>
          </div>
          <QuestionEditor questions={newTest.questions} setQuestions={(fn) => setNewTest(t => ({ ...t, questions: typeof fn === "function" ? fn(t.questions) : fn }))} />
          <button className={`${primaryBtnCls} mt-4`} disabled={saving} onClick={createTest}>{saving ? "Creating…" : "Create Test"}</button>
        </div>
      )}

      {loading && <p className="text-text-muted">Loading tests…</p>}

      <div className="w-full overflow-x-auto">
        <table className="w-full border-collapse min-w-[560px]">
          <thead>
            <tr><th className={thCls}>Title</th><th className={thCls}>Exam</th><th className={thCls}>Duration</th><th className={thCls}>Questions</th><th className={thCls}>Actions</th></tr>
          </thead>
          <tbody>
            {tests.map(test => {
              const isExpanded = expandedId === test.id;
              return (
                <React.Fragment key={test.id}>
                  <tr className="hover:bg-bg-secondary">
                    <td className={tdCls}><strong>{test.title}</strong></td>
                    <td className={tdCls}>{test.exam_type}</td>
                    <td className={tdCls}>{test.duration_minutes} min</td>
                    <td className={tdCls}>{(test.questions || []).length}</td>
                    <td className={`${tdCls} flex gap-2 flex-wrap`}>
                      <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title={isExpanded ? "Collapse" : "Edit questions"}
                        onClick={() => isExpanded ? (setExpandedId(null), setEditDraft(null)) : startEdit(test)}>
                        {isExpanded ? <ChevronUp size={14} /> : <Pencil size={14} />}
                      </button>
                      <button className={`${iconBtnCls} bg-red-100 text-red-600`} title="Delete" onClick={() => deleteTest(test.id)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                  {isExpanded && editDraft && (
                    <tr>
                      <td className={tdCls} colSpan={5}>
                        <div className="flex flex-col gap-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className={labelCls}>Title</label>
                              <input className={inputCls} value={editDraft.title} onChange={e => setEditDraft(d => ({ ...d, title: e.target.value }))} />
                            </div>
                            <div>
                              <label className={labelCls}>Exam type</label>
                              <select className={inputCls} value={editDraft.exam_type} onChange={e => setEditDraft(d => ({ ...d, exam_type: e.target.value }))}>
                                <option value="NEET">NEET</option>
                                <option value="JEE">JEE</option>
                                <option value="State Board">State Board</option>
                              </select>
                            </div>
                            <div>
                              <label className={labelCls}>Duration (minutes)</label>
                              <input type="number" className={inputCls} value={editDraft.duration_minutes} onChange={e => setEditDraft(d => ({ ...d, duration_minutes: Number(e.target.value) }))} />
                            </div>
                          </div>
                          <QuestionEditor questions={editDraft.questions} setQuestions={(fn) => setEditDraft(d => ({ ...d, questions: typeof fn === "function" ? fn(d.questions) : fn }))} />
                          <div className="flex gap-2.5">
                            <button className={primaryBtnCls} disabled={saving} onClick={() => saveEdit(test.id)}><Check size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />{saving ? "Saving…" : "Save"}</button>
                            <button className={secondaryBtnCls} onClick={() => { setExpandedId(null); setEditDraft(null); }}><XCircle size={14} style={{ verticalAlign: "-2px", marginRight: 5 }} />Cancel</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
            {!loading && tests.length === 0 && <tr><td className={tdCls} colSpan={5}>No mock tests yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
