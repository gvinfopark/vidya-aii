import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Bot } from "lucide-react";

export default function PageLayout({ userName, onLogout, children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const onVidya   = location.pathname === "/vidya";

  return (
    <div className="flex flex-row min-h-screen w-full overflow-x-hidden bg-bg">
      {/* VIDYA relies on filling exactly 100dvh, so it gets no padding here
          (padding on top of that produced extra empty space above/below the
          chat UI on small screens). Every other page keeps this padding —
          `.page-wrap` (in page.css) no longer adds its own, to avoid the
          double top/bottom padding that was showing up on mobile. */}
      <div
        className={`flex-1 min-h-screen box-border bg-bg w-full max-w-full transition-[margin-left,width] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          onVidya ? "" : "py-4 px-3 sm:py-5 sm:px-4 lg:py-[22px] lg:px-5"
        }`}
      >
        {children}
      </div>

      {!onVidya && (
        <button
          className="fixed bottom-5 right-5 sm:bottom-7 sm:right-7 z-[999] flex items-center gap-2 py-3.5 px-5 bg-accent border-none rounded-[50px] text-white font-sans text-[15px] font-bold cursor-pointer shadow-[0_6px_24px_rgba(218,119,86,0.35),0_2px_8px_rgba(0,0,0,0.12)] transition-all tracking-wide hover:-translate-y-1 hover:scale-[1.04] hover:shadow-[0_10px_32px_rgba(218,119,86,0.45),0_4px_12px_rgba(0,0,0,0.15)] hover:bg-accent-hover active:translate-y-0 active:scale-[0.98]"
          onClick={() => navigate("/vidya")}
          title="Open VIDYA AI"
        >
          <span className="text-xl leading-none"><Bot size={20} /></span>
          <span className="text-sm font-bold tracking-wide whitespace-nowrap">VIDYA AI</span>
        </button>
      )}
    </div>
  );
}