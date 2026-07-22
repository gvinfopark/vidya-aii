import React, { useState } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Atom, FlaskConical, Leaf, PawPrint, Cross, HelpCircle } from "lucide-react";
import "../page.css";

const TOPICS = [
  { subject: "Physics",   icon: Atom, color: "#1a5276", bg: "#d6eaf8", chapters: 29, weightage: "25%", topics: ["Mechanics","Kinematics","Thermodynamics","Optics","Modern Physics"] },
  { subject: "Chemistry", icon: FlaskConical, color: "#7d3c98", bg: "#e8daef", chapters: 30, weightage: "25%", topics: ["Organic","Inorganic","Physical","Electrochemistry","Polymers"] },
  { subject: "Botany",    icon: Leaf, color: "#1e8449", bg: "#d5f5e3", chapters: 20, weightage: "25%", topics: ["Plant Kingdom","Morphology","Anatomy","Physiology","Genetics"] },
  { subject: "Zoology",   icon: PawPrint, color: "#c9922a", bg: "#fdebd0", chapters: 18, weightage: "25%", topics: ["Animal Kingdom","Structural Organisation","Human Physiology","Genetics","Ecology"] },
];

const PREV_Q = [
  { year: "2024", q: "In which phase do chromosomes move to poles?", answer: "Anaphase", subject: "Biology" },
  { year: "2024", q: "SI unit of electric flux is ___", answer: "N·m²/C", subject: "Physics" },
  { year: "2023", q: "Which enzyme is involved in DNA replication?", answer: "DNA Polymerase", subject: "Biology" },
  { year: "2023", q: "pH of pure water at 25°C is ___", answer: "7", subject: "Chemistry" },
];

export default function NEETSyllabus({ userName, onLogout }) {
  const [expanded, setExpanded] = useState(null);
  const [collapsed, setCollapsed] = useState(true);
  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, overflowY: "auto" }}>
      <div className="page-wrap">
        <div className="page-hero" style={{ background: "linear-gradient(135deg,#1a3c2a,#1e8449)" }}>
          <div className="page-hero-badge"><Cross size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Medical Entrance</div>
          <h1>NEET Syllabus</h1>
          <p>NTA-prescribed topic-wise syllabus with weightage from 10 years of previous papers. Prioritise smartly.</p>
          <div className="page-hero-meta">
            {[["97","Chapters"],["1800+","Topics"],["720","Max Score"]].map(([n,l]) => (
              <div key={l} className="page-hero-stat">
                <div className="page-hero-stat-num">{n}</div>
                <div className="page-hero-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="page-section-title">Subject <span>Breakdown</span></h2>
        <div style={{ display:"flex", flexDirection:"column", gap:14, marginBottom:40 }}>
          {TOPICS.map((t) => (
            <div key={t.subject} style={{ background:"white", border:"1.5px solid var(--border)", borderRadius:16, overflow:"hidden" }}>
              <div style={{ display:"flex", alignItems:"center", gap:16, padding:"20px 24px", cursor:"pointer" }}
                onClick={() => setExpanded(expanded===t.subject ? null : t.subject)}>
                <div style={{ width:46,height:46,borderRadius:12,background:t.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}><t.icon size={22} color={t.color} /></div>
                <div style={{ flex:1 }}>
                  <div style={{ fontWeight:700,fontSize:16,color:"var(--ink)" }}>{t.subject}</div>
                  <div style={{ fontSize:12,color:"var(--muted)",marginTop:2 }}>{t.chapters} chapters · Weightage: <b style={{ color:t.color }}>{t.weightage}</b></div>
                </div>
                <div style={{ fontSize:20,color:"var(--muted)", transition:"transform 0.2s", transform: expanded===t.subject ? "rotate(90deg)" : "none" }}>›</div>
              </div>
              {expanded===t.subject && (
                <div style={{ padding:"0 24px 20px", display:"flex", flexWrap:"wrap", gap:8 }}>
                  {t.topics.map(tp => (
                    <span key={tp} style={{ padding:"5px 14px", borderRadius:20, background:t.bg, color:t.color, fontSize:13, fontWeight:500 }}>{tp}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="page-section-title">Previous Year <span>Questions</span></h2>
        {PREV_Q.map((q,i) => (
          <div key={i} className="list-row">
            <div className="list-row-icon" style={{ background:"var(--cream)", fontSize:16 }}><HelpCircle size={18} color="var(--gold, #c9922a)" /></div>
            <div style={{ flex:1 }}>
              <div className="list-row-title">{q.q}</div>
              <div className="list-row-sub">NEET {q.year} · {q.subject} · Ans: <b>{q.answer}</b></div>
            </div>
            <span className="list-row-badge" style={{ background:"var(--cream)", color:"var(--gold)" }}>{q.year}</span>
          </div>
        ))}
      </div>
        </div>
      </div>
    </PageLayout>
  );
}
