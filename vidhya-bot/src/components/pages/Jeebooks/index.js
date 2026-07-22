import React, { useState } from "react";
import PageLayout from "../../Layout/PageLayout";
import SideNav from "../../Layout/SideNav";
import { Atom, FlaskConical, Calculator, ClipboardList, GraduationCap } from "lucide-react";
import "../page.css";

const BOOKS = [
  { icon: Atom, title: "H.C. Verma Vol I & II", sub: "Physics · Concepts of Physics", rating: "★★★★★", tag: "Must Have", bg: "#d6eaf8", color: "#1a5276" },
  { icon: Calculator, title: "R.D. Sharma", sub: "Mathematics for JEE", rating: "★★★★★", tag: "Must Have", bg: "#fdebd0", color: "#c9922a" },
  { icon: FlaskConical, title: "O.P. Tandon", sub: "Physical & Organic Chemistry", rating: "★★★★☆", tag: "Recommended", bg: "#e8daef", color: "#7d3c98" },
  { icon: Atom, title: "Cengage Physics", sub: "Chapter-wise problems", rating: "★★★★☆", tag: "Recommended", bg: "#d6eaf8", color: "#1a5276" },
  { icon: Calculator, title: "Arihant Algebra", sub: "JEE Main & Advanced", rating: "★★★★☆", tag: "Recommended", bg: "#fdebd0", color: "#c9922a" },
  { icon: FlaskConical, title: "MS Chouhan", sub: "Organic Chemistry Problems", rating: "★★★★☆", tag: "Optional", bg: "#e8daef", color: "#7d3c98" },
  { icon: ClipboardList, title: "PYQ 2014–2024", sub: "Solved Previous Year Papers", rating: "★★★★★", tag: "Must Have", bg: "#d5f5e3", color: "#1e8449" },
  { icon: ClipboardList, title: "JEE Mock Tests", sub: "Full Length Practice Tests", rating: "★★★★☆", tag: "Practice", bg: "#d5f5e3", color: "#1e8449" },
];

export default function JEEBooks({ userName, onLogout }) {
  const [collapsed, setCollapsed] = useState(true);
  return (
    <PageLayout userName={userName}>
      <div style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
        <SideNav userName={userName} onLogout={onLogout} collapsed={collapsed} setCollapsed={setCollapsed} />
        <div style={{ flex: 1, overflowY: "auto" }}>
      <div className="page-wrap">
        <div className="page-hero" style={{ background: "linear-gradient(135deg,#4a1520,#c0392b)" }}>
          <div className="page-hero-badge"><GraduationCap size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Engineering Entrance</div>
          <h1>JEET Books</h1>
          <p>Handpicked reference books recommended by toppers and educators for JEE Main & Advanced preparation.</p>
          <div className="page-hero-meta">
            {[["60+","Books"],["2000+","Problems"],["10","Years PYQ"]].map(([n,l]) => (
              <div key={l} className="page-hero-stat">
                <div className="page-hero-stat-num">{n}</div>
                <div className="page-hero-stat-lbl">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <h2 className="page-section-title">Recommended <span>Books</span></h2>
        <div className="card-grid">
          {BOOKS.map((b,i) => (
            <div key={i} className="info-card">
              <div style={{ width:48, height:48, borderRadius:12, background:b.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, marginBottom:14 }}><b.icon size={22} color={b.color} /></div>
              <span style={{ background:b.tag==="Must Have"?"#fadbd8":b.tag==="Recommended"?"#d5f5e3":"var(--cream)", color:b.tag==="Must Have"?"#c0392b":b.tag==="Recommended"?"#1e8449":"var(--slate)", fontSize:10, fontWeight:700, padding:"2px 10px", borderRadius:20, letterSpacing:"0.5px", textTransform:"uppercase" }}>{b.tag}</span>
              <div className="info-card-title" style={{ marginTop:10 }}>{b.title}</div>
              <div className="info-card-desc">{b.sub}</div>
              <div style={{ fontSize:14, color:"var(--gold)", marginBottom:14 }}>{b.rating}</div>
              <button className="btn-primary" style={{ fontSize:12, padding:"8px 16px", background:b.color }}>View Details →</button>
            </div>
          ))}
        </div>
      </div>
        </div>
      </div>
    </PageLayout>
  );
}
