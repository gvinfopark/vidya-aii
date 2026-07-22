import React, { useState } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Atom, FlaskConical, Dna, Calculator, BookOpen, MapPin } from "lucide-react";
import "../page.css";

const BOOKS = [
  { icon: Atom, title: "Physics State Vol 1",    sub: "Class XI",   chips: ["Mechanics","Kinematics"],        bg: "#fcf3cf", color: "#b7950b" },
  { icon: FlaskConical, title: "Chemistry State Vol 1",  sub: "Class XI",   chips: ["Mole Concept","Bonding"],        bg: "#f2d7d5", color: "#922b21" },
  { icon: Dna, title: "Biology State",           sub: "Class XI",    chips: ["Cell","Plant Physiology"],       bg: "#d5f5e3", color: "#1e8449" },
  { icon: Calculator, title: "Mathematics State",       sub: "Class XI",    chips: ["Sets","Trigonometry"],           bg: "#ebdef0", color: "#76448a" },
  { icon: MapPin, title: "State Language",        sub: "Class XI", chips: ["Literature","Grammar"],          bg: "#d4e6f1", color: "#2471a3" },
  { icon: Atom, title: "Physics State Vol 2",    sub: "Class XII",  chips: ["Electrostatics","Current"],      bg: "#fcf3cf", color: "#b7950b" },
  { icon: FlaskConical, title: "Chemistry State Vol 2",  sub: "Class XII",  chips: ["Solid State","Electrochemistry"],bg: "#f2d7d5", color: "#922b21" },
  { icon: Dna, title: "Biology State",           sub: "Class XII",   chips: ["Genetics","Ecology"],            bg: "#d5f5e3", color: "#1e8449" },
  { icon: MapPin, title: "State Language",        sub: "Class XII", chips: ["Literature","Writing"],  bg: "#d4e6f1", color: "#2471a3" },
];

const FILTERS = ["All","Physics","Chemistry","Biology","Mathematics","Language"];

export default function StateBoard({ userName, onLogout }) {
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
        <div className="page-hero" style={{ background: "linear-gradient(135deg,#b9770e,#f1c40f)" }}>
          <div className="page-hero-badge"><MapPin size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />State Board Curriculum</div>
          <h1>State Board Materials</h1>
          <p>Curated study materials, question banks, and notes mapped exactly to the latest State Board syllabus.</p>
          <div className="page-hero-meta">
            {[["24","Modules"],["80+","Papers"],["5","Subjects"]].map(([n,l]) => (
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
              borderColor: active===f ? "var(--accent)" : "var(--border)",
              background: active===f ? "var(--accent)" : "transparent",
              color: active===f ? "white" : "var(--text)",
              fontSize:13, fontWeight:600, cursor:"pointer",
              fontFamily:"'Inter',sans-serif", transition:"all 0.2s",
            }}>{f}</button>
          ))}
        </div>
        <h2 className="page-section-title">Available <span>Materials</span></h2>
        <div className="card-grid">
          {filtered.map((b,i) => (
            <div key={i} className="info-card">
              <div style={{ width:48, height:48, borderRadius:12, background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}><b.icon size={22} color={b.color} /></div>
              <div className="info-card-title">{b.title}</div>
              <div className="info-card-desc">{b.sub}</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:16 }}>
                {b.chips.map(c => <span key={c} className="info-card-chip" style={{ background:b.bg, color:b.color, border:"none" }}>{c}</span>)}
              </div>
              <button className="btn-primary" style={{ fontSize:12, padding:"8px 16px", background:b.color }}>Open Material →</button>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </PageLayout>
  );
}
