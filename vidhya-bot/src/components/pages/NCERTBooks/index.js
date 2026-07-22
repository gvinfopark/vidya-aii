import React, { useState } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Atom, FlaskConical, Dna, Calculator, BookOpen } from "lucide-react";
import "../page.css";

const BOOKS = [
  { icon: Atom, title: "Physics Part I",    sub: "Class XI · Ch 1–8",   chips: ["Mechanics","Kinematics"],        bg: "#d6eaf8", color: "#1a5276" },
  { icon: Atom, title: "Physics Part II",   sub: "Class XI · Ch 9–15",  chips: ["Waves","Optics"],                bg: "#d6eaf8", color: "#1a5276" },
  { icon: FlaskConical, title: "Chemistry Part I",  sub: "Class XI · Ch 1–7",   chips: ["Mole Concept","Bonding"],        bg: "#e8daef", color: "#7d3c98" },
  { icon: FlaskConical, title: "Chemistry Part II", sub: "Class XI · Ch 8–14",  chips: ["Organic","Equilibrium"],         bg: "#e8daef", color: "#7d3c98" },
  { icon: Dna, title: "Biology",           sub: "Class XI · 22 Ch",    chips: ["Cell","Plant Physiology"],       bg: "#d5f5e3", color: "#1e8449" },
  { icon: Calculator, title: "Mathematics",       sub: "Class XI · 16 Ch",    chips: ["Sets","Trigonometry"],           bg: "#fdebd0", color: "#c9922a" },
  { icon: Atom, title: "Physics Part I",    sub: "Class XII · Ch 1–8",  chips: ["Electrostatics","Current"],      bg: "#d6eaf8", color: "#1a5276" },
  { icon: Atom, title: "Physics Part II",   sub: "Class XII · Ch 9–15", chips: ["Modern Physics","Atoms"],        bg: "#d6eaf8", color: "#1a5276" },
  { icon: FlaskConical, title: "Chemistry Part I",  sub: "Class XII · Ch 1–8",  chips: ["Solid State","Electrochemistry"],bg: "#e8daef", color: "#7d3c98" },
  { icon: Dna, title: "Biology",           sub: "Class XII · 16 Ch",   chips: ["Genetics","Ecology"],            bg: "#d5f5e3", color: "#1e8449" },
];

const FILTERS = ["All","Physics","Chemistry","Biology","Mathematics"];

export default function NCERTBooks({ userName, onLogout }) {
  const [active, setActive] = useState("All");
  const [collapsed, setCollapsed] = useState(true);
  const filtered = active === "All" ? BOOKS
    : BOOKS.filter(b => b.title.toLowerCase().includes(active.toLowerCase()) || b.chips.join(" ").toLowerCase().includes(active.toLowerCase()));

  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, overflowY: "auto" }}>
      <div className="page-wrap">
        <div className="page-hero" style={{ background: "linear-gradient(135deg,#0d3349,#1a5276)" }}>
          <div className="page-hero-badge"><BookOpen size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />CBSE Curriculum</div>
          <h1>NCERT Books</h1>
          <p>Complete Class XI & XII textbooks with chapter-wise notes, key concepts, and exercises for all subjects.</p>
          <div className="page-hero-meta">
            {[["29","Books"],["400+","Chapters"],["6","Subjects"]].map(([n,l]) => (
              <div key={l} className="page-hero-stat">
                <div className="page-hero-stat-num">{n}</div>
                <div className="page-hero-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ display:"flex", gap:10, marginBottom:28, flexWrap:"wrap" }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setActive(f)} style={{
              padding:"7px 18px", borderRadius:20, border:"1.5px solid",
              borderColor: active===f ? "var(--teal)" : "var(--border)",
              background: active===f ? "var(--teal)" : "white",
              color: active===f ? "white" : "var(--slate)",
              fontSize:13, fontWeight:600, cursor:"pointer",
              fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
            }}>{f}</button>
          ))}
        </div>
        <h2 className="page-section-title">Available <span>Books</span></h2>
        <div className="card-grid">
          {filtered.map((b,i) => (
            <div key={i} className="info-card">
              <div style={{ width:48, height:48, borderRadius:12, background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}><b.icon size={22} color={b.color} /></div>
              <div className="info-card-title">{b.title}</div>
              <div className="info-card-desc">{b.sub}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {b.chips.map(c => <span key={c} className="info-card-chip" style={{ background:b.bg, color:b.color, border:"none" }}>{c}</span>)}
              </div>
              <button className="btn-primary" style={{ fontSize:12, padding:"8px 16px", background:b.color }}>Open Book →</button>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </PageLayout>
  );
}
