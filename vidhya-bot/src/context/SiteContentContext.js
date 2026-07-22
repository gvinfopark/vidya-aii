import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { content as contentApi } from "../services/api";

const SiteContentContext = createContext(null);

// Sensible fallback so the UI never breaks if the backend/content doc is unreachable.
const FALLBACK_CONTENT = {
  hero: {
    badge: "2025–26 Session Active",
    title_line1: "Ready to Study?",
    title_line2: "",
    subtitle: "Your personalised dashboard is loaded. Continue where you left off or explore new chapters today.",
    cta_primary_text: "Start Preparing",
    cta_secondary_text: "Take a Mock Test",
  },
  banner: { enabled: false, message: "", type: "info" },
  quick_access: [
    { icon: "ClipboardList", title: "Mock Tests", sub: "Practice under real exam conditions", path: "/mock-tests" },
    { icon: "BarChart3", title: "Analytics", sub: "Track your progress", path: "/analytics" },
    { icon: "Layers", title: "Flashcards", sub: "Smart revision", path: "/flashcards" },
    { icon: "Target", title: "Study Planner", sub: "Custom schedule", path: "/study-planner" },
  ],
  sections: { show_quick_access: true, show_progress: true, show_schedule: true, show_banner: false },
  theme: { accent: "#10A37F", primary: "#0D0D0D" },
};

function applyThemeVars(theme) {
  if (!theme) return;
  const root = document.documentElement;
  if (theme.accent) {
    root.style.setProperty("--c-accent", theme.accent);
    root.style.setProperty("--c-accent-hover", theme.accent);
    root.style.setProperty("--c-accent-active", theme.accent);
    root.style.setProperty("--c-accent-text", theme.accent);
  }
  if (theme.primary) {
    root.style.setProperty("--c-primary", theme.primary);
  }
}

export function SiteContentProvider({ children }) {
  const [siteContent, setSiteContent] = useState(FALLBACK_CONTENT);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await contentApi.get();
      setSiteContent(data);
      applyThemeVars(data.theme);
    } catch (err) {
      // Backend unreachable — silently fall back to defaults, don't block the app.
      console.warn("Site content unavailable, using defaults:", err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return (
    <SiteContentContext.Provider value={{ siteContent, loading, refresh }}>
      {children}
    </SiteContentContext.Provider>
  );
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) throw new Error("useSiteContent must be used within a SiteContentProvider");
  return ctx;
}
