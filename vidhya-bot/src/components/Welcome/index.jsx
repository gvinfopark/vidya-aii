import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import vidyaIcon from "../../assets/vidya_icon.png";   // the colourful pentagon
import vidyaText from "../../assets/vidya_text.png";   // the VIDYA wordmark
import ThemeToggle from "../ThemeToggle/ThemeToggle";

const revealCls = (visible) =>
  `opacity-0 translate-y-[22px] transition-all duration-500 ease-out ${visible ? "!opacity-100 !translate-y-0" : ""}`;

export default function Welcome() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: canvas.height + 20,
      vx: (Math.random() - 0.5) * 2.5,
      vy: -(Math.random() * 4 + 2),
      radius: Math.random() * 5 + 2,
      color: ["#38bdf8", "#0284c7", "#f59e0b", "#7dd3fc", "#bae6fd"][Math.floor(Math.random() * 5)],
      alpha: 1,
      decay: Math.random() * 0.008 + 0.004,
    }));

    let raf;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.04;
        p.alpha -= p.decay;
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans p-5 sm:p-10 bg-[linear-gradient(160deg,#f0f8ff_0%,#cce9f9_35%,#b3dff5_65%,#d6eefb_100%)]">
      <ThemeToggle className="fixed top-3 right-3 sm:top-5 sm:right-5" />
      {/* Layer 0: particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Layer 1: orbs */}
      <div className="absolute rounded-full blur-[90px] opacity-[0.22] pointer-events-none z-[1] w-[480px] h-[480px] bg-[#7dd3fc] -top-[120px] -left-[100px] animate-orbFloat1" />
      <div className="absolute rounded-full blur-[90px] opacity-[0.22] pointer-events-none z-[1] w-[360px] h-[360px] bg-[#38bdf8] -bottom-20 -right-20 animate-orbFloat2" />
      <div className="absolute rounded-full blur-[90px] opacity-[0.22] pointer-events-none z-[1] w-[260px] h-[260px] bg-[#bae6fd] bottom-[30%] left-[60%] animate-orbFloat3" />

      {/* Layer 2a: icon pinned to LEFT of viewport */}
      <img
        src={vidyaIcon} alt="" aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 h-[min(420px,46vw)] w-auto object-contain z-[2] pointer-events-none opacity-55 [filter:saturate(2.2)_brightness(1.1)] animate-wmIconFloat"
        style={{ left: "calc(50% - 680px)" }}
      />

      {/* Layer 2b: VIDYA text pinned to RIGHT of viewport */}
      <img
        src={vidyaText} alt="" aria-hidden="true"
        className="hidden md:block absolute top-1/2 -translate-y-1/2 h-[min(320px,35vw)] w-auto object-contain z-[2] pointer-events-none animate-wmTextFloat"
        style={{ right: "calc(50% - 540px)" }}
      />

      {/* Layer 3: card */}
      <div className="relative z-[3] flex flex-col items-center text-center max-w-[460px] w-full bg-surface border border-border rounded-[28px] px-6 py-10 sm:px-11 sm:pt-[52px] sm:pb-12 backdrop-blur-xl shadow-[0_8px_40px_rgba(56,189,248,0.13),0_2px_8px_rgba(0,0,0,0.04)]">

        {/* Top badge */}
        <div className={`inline-flex items-center gap-1.5 bg-[rgba(0,150,120,0.1)] border border-[rgba(0,150,120,0.3)] text-[#007a65] text-xs font-medium tracking-wider uppercase px-3.5 py-1.5 rounded-full mb-8 ${revealCls(visible)}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-[#007a65] animate-pulseDot" /> Account Created
        </div>

        {/* Headline */}
        <h1 className={`font-display text-[34px] sm:text-[44px] font-bold leading-[1.15] text-text mb-4 tracking-[-0.5px] delay-150 ${revealCls(visible)}`}>
          You're all set,<br />let's begin.
        </h1>

        <p className={`text-text-muted text-[15px] leading-relaxed mb-9 delay-300 ${revealCls(visible)}`}>
          Your Vidya account is live. Start learning smarter — explore your
          personalised dashboard and take your first step forward.
        </p>

        {/* Stats strip */}
        <div className={`flex w-full border border-[rgba(56,189,248,0.2)] rounded-2xl overflow-hidden mb-9 delay-[450ms] ${revealCls(visible)}`}>
          {[
            { value: "10K+", label: "Learners" },
            { value: "Neet&jee", label: "Courses" },
            { value: "98%",  label: "Satisfaction" },
          ].map(({ value, label }) => (
            <div className="flex-1 flex flex-col items-center px-2.5 py-3.5 bg-bg-secondary transition-colors hover:bg-[rgba(56,189,248,0.1)] border-l border-[rgba(56,189,248,0.2)] first:border-l-0" key={label}>
              <span className="text-xl font-semibold text-accent-text tracking-[-0.3px] leading-tight">{value}</span>
              <span className="text-[11px] text-text-faint mt-1 uppercase tracking-wider">{label}</span>
            </div>
          ))}
        </div>

        {/* CTA */}
        <button
          className={`group flex items-center gap-2.5 bg-primary text-primary-text font-sans text-[15px] font-semibold border-none rounded-2xl py-4 px-8 cursor-pointer w-full justify-center tracking-wide transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(2,132,199,0.3)] active:translate-y-0 delay-[600ms] ${revealCls(visible)}`}
          onClick={() => navigate("/vidya")}
        >
          <span>Start with VIDYA AI</span>
          <span className="text-lg transition-transform group-hover:translate-x-1">→</span>
        </button>
      </div>
    </div>
  );
}