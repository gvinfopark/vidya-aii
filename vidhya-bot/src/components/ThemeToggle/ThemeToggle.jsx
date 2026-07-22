import React from "react";
import { Sun, Moon } from "lucide-react";
import useTheme from "../../useTheme";

/**
 * Small icon-button that flips between light and dark mode.
 * Drop this anywhere in the app — it drives the same global theme state.
 */
export default function ThemeToggle({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`inline-flex items-center justify-center w-[34px] h-[34px] rounded-full border border-border bg-surface text-text-muted cursor-pointer transition-all shrink-0 hover:bg-bg-tertiary hover:text-text hover:border-border-strong ${className}`}
      onClick={toggleTheme}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle color theme"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
