import React, { useState, useEffect, useCallback } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import {
  PartyPopper, CheckCircle2, RotateCcw, Layers, Plus, Trash2,
} from "lucide-react";
import { flashcards as flashcardsApi } from "../../../services/api";
import { subjectStyle } from "../subjectStyle";
import "../page.css";

// Groups the flat flashcard list returned by the API into per-subject "decks"
function groupIntoDecks(cards) {
  const bySubject = {};
  for (const c of cards) {
    const key = c.subject || "General";
    if (!bySubject[key]) bySubject[key] = [];
    bySubject[key].push(c);
  }
  return Object.entries(bySubject).map(([subject, deckCards]) => {
    const { icon, color, bg } = subjectStyle(subject);
    return { subject, title: subject, count: deckCards.length, icon, color, bg, cards: deckCards };
  });
}

function DeckStudy({ deck, onBack, onReview }) {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const [known, setKnown] = useState([]);
  const [review, setReview] = useState([]);

  const card = deck.cards[idx];
  const total = deck.cards.length;
  const done = known.length + review.length;

  const mark = (status) => {
    if (status === "known") setKnown((k) => [...k, idx]);
    else setReview((r) => [...r, idx]);
    onReview(card.id, status === "known" ? "correct" : "incorrect");
    setFlip(false);
    setTimeout(() => setIdx((i) => i + 1), 200);
  };

  if (idx >= total) {
    return (
      <div style={{ maxWidth: 480, margin: "80px auto", padding: 32, background: "white", borderRadius: 24, boxShadow: "0 12px 40px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><PartyPopper size={48} color="#1e8449" /></div>
        <h2 style={{ fontFamily: "var(--font-sans, 'Inter', sans-serif)", fontSize: 26, marginBottom: 10 }}>Deck Complete!</h2>
        <p style={{ color: "var(--muted)", marginBottom: 24, display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><CheckCircle2 size={15} color="#1e8449" />{known.length} known</span>
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}><RotateCcw size={15} color="#c0392b" />{review.length} need review</span>
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button className="btn-primary" onClick={() => { setIdx(0); setKnown([]); setReview([]); }}>
            Restart Deck
          </button>
          <button className="btn-outline" onClick={onBack}>← All Decks</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", padding: "0 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <button className="btn-outline" style={{ fontSize: 13, padding: "7px 14px" }} onClick={onBack}>← Back</button>
        <div style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600, display: "flex", alignItems: "center", gap: 14 }}>
          <span>{idx + 1} / {total}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CheckCircle2 size={14} color="#1e8449" />{known.length}</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}><RotateCcw size={14} color="#c0392b" />{review.length}</span>
        </div>
      </div>

      <div style={{ height: 6, background: "var(--cream)", borderRadius: 10, overflow: "hidden", marginBottom: 28 }}>
        <div style={{ width: `${(done / total) * 100}%`, height: "100%", background: deck.color, borderRadius: 10, transition: "width 0.4s" }} />
      </div>

      <div onClick={() => setFlip((f) => !f)} style={{
        minHeight: 220, background: flip ? "var(--ink)" : "white",
        border: `2px solid ${flip ? deck.color : "var(--border)"}`,
        borderRadius: 20, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "36px 40px", cursor: "pointer",
        transition: "all 0.3s", boxShadow: "0 8px 32px rgba(0,0,0,0.09)",
        textAlign: "center", userSelect: "none", marginBottom: 24,
      }}>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase",
          color: flip ? deck.color : "var(--muted)", marginBottom: 16 }}>
          {flip ? "ANSWER — tap to go back" : "QUESTION — tap to reveal"}
        </div>
        <div style={{ fontSize: 18, fontWeight: 600, color: flip ? "white" : "var(--ink)", lineHeight: 1.55 }}>
          {flip ? card.answer : card.question}
        </div>
      </div>

      {flip && (
        <div style={{ display: "flex", gap: 14 }}>
          <button onClick={() => mark("review")} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "2px solid #c0392b",
            background: "#fadbd8", color: "#c0392b", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><RotateCcw size={16} /> Need Review</button>
          <button onClick={() => mark("known")} style={{
            flex: 1, padding: "14px", borderRadius: 12, border: "2px solid #1e8449",
            background: "#d5f5e3", color: "#1e8449", fontWeight: 700, fontSize: 14,
            cursor: "pointer", fontFamily: "'DM Sans',sans-serif",
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          }}><CheckCircle2 size={16} /> Got It!</button>
        </div>
      )}
      {!flip && (
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
          Tap the card to reveal the answer
        </div>
      )}
    </div>
  );
}

export default function Flashcards({ userName, onLogout }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeDeck, setActiveDeck] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ subject: "", topic: "", question: "", answer: "" });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await flashcardsApi.list();
      setCards(data);
    } catch (err) {
      setError(err.message || "Could not load flashcards");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const decks = groupIntoDecks(cards);
  const totalCards = cards.length;

  const handleReview = async (cardId, result) => {
    try { await flashcardsApi.review(cardId, { result }); } catch { /* non-blocking */ }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      await flashcardsApi.create(form);
      setForm({ subject: "", topic: "", question: "", answer: "" });
      setShowForm(false);
      await load();
    } catch (err) {
      setError(err.message || "Could not create flashcard");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDeck = async (deck) => {
    if (!window.confirm(`Delete all ${deck.count} cards in "${deck.subject}"?`)) return;
    try {
      await Promise.all(deck.cards.map((c) => flashcardsApi.remove(c.id)));
      await load();
    } catch (err) {
      setError(err.message || "Could not delete deck");
    }
  };

  if (activeDeck) {
    return (
      <PageLayout userName={userName}>
        <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
          <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
          <div style={{ flex: 1, overflowY: "auto" }}>
            <div className="page-wrap">
              <DeckStudy deck={activeDeck} onBack={() => setActiveDeck(null)} onReview={handleReview} />
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />

        <div style={{ flex: 1, overflowY: "auto" }}>
          <div className="page-wrap">
            <div className="page-hero" style={{ background: "linear-gradient(135deg,#2c1654,#7d3c98)" }}>
              <div className="page-hero-badge"><Layers size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Smart Revision</div>
              <h1>Flashcards</h1>
              <p>Your own spaced-repetition flashcard decks, saved to your account. Study less, remember more.</p>
              <div className="page-hero-meta">
                {[[`${totalCards}`, "Cards"], [`${decks.length}`, "Decks"]].map(([n, l]) => (
                  <div key={l} className="page-hero-stat">
                    <div className="page-hero-stat-num">{n}</div>
                    <div className="page-hero-stat-lbl">{l}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
              <h2 className="page-section-title" style={{ marginBottom: 0 }}>All <span>Decks</span></h2>
              <button className="btn-primary" style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, padding: "9px 16px" }}
                onClick={() => setShowForm((s) => !s)}>
                <Plus size={16} /> {showForm ? "Cancel" : "Add Flashcard"}
              </button>
            </div>

            {showForm && (
              <form className="page-form" onSubmit={handleCreate}>
                <div className="page-form-field">
                  <label>Subject</label>
                  <input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} placeholder="e.g. Biology XI" required />
                </div>
                <div className="page-form-field">
                  <label>Topic (optional)</label>
                  <input value={form.topic} onChange={(e) => setForm((f) => ({ ...f, topic: e.target.value }))} placeholder="e.g. Cell Biology" />
                </div>
                <div className="page-form-field" style={{ minWidth: 220 }}>
                  <label>Question</label>
                  <textarea value={form.question} onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))} required />
                </div>
                <div className="page-form-field" style={{ minWidth: 220 }}>
                  <label>Answer</label>
                  <textarea value={form.answer} onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))} required />
                </div>
                <button className="btn-primary" type="submit" disabled={saving} style={{ fontSize: 13, padding: "10px 18px" }}>
                  {saving ? "Saving…" : "Save Card"}
                </button>
              </form>
            )}

            {loading && (
              <div className="page-state"><div className="page-state-spinner" />Loading your flashcards…</div>
            )}
            {!loading && error && <div className="page-state page-state-error">{error}</div>}

            {!loading && !error && decks.length === 0 && (
              <div className="page-state">
                <Layers size={32} color="var(--muted)" />
                No flashcards yet — add your first card above to build your first deck.
              </div>
            )}

            {!loading && !error && decks.length > 0 && (
              <div className="card-grid">
                {decks.map((d) => (
                  <div key={d.subject} className="info-card" onClick={() => setActiveDeck(d)}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 12, background: d.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14 }}>
                        <d.icon size={22} color={d.color} />
                      </div>
                      <button title="Delete deck" onClick={(e) => { e.stopPropagation(); handleDeleteDeck(d); }}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--muted)", padding: 4 }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="info-card-title">{d.title}</div>
                    <div className="info-card-desc">{d.count} card{d.count !== 1 ? "s" : ""}</div>
                    <button className="btn-primary" style={{ fontSize: 12, padding: "8px 16px", background: d.color }}
                      onClick={(e) => { e.stopPropagation(); setActiveDeck(d); }}>
                      Study Deck →
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
