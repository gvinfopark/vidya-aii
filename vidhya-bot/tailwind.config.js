/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: "var(--c-bg)",
        "bg-secondary": "var(--c-bg-secondary)",
        "bg-tertiary": "var(--c-bg-tertiary)",
        surface: "var(--c-surface)",
        "surface-raised": "var(--c-surface-raised)",
        text: "var(--c-text)",
        "text-muted": "var(--c-text-muted)",
        "text-faint": "var(--c-text-faint)",
        "text-on-accent": "var(--c-text-on-accent)",
        border: "var(--c-border)",
        "border-strong": "var(--c-border-strong)",
        accent: "var(--c-accent)",
        "accent-hover": "var(--c-accent-hover)",
        "accent-active": "var(--c-accent-active)",
        "accent-soft": "var(--c-accent-soft)",
        "accent-soft-strong": "var(--c-accent-soft-strong)",
        "accent-text": "var(--c-accent-text)",
        primary: "var(--c-primary)",
        "primary-hover": "var(--c-primary-hover)",
        "primary-text": "var(--c-primary-text)",
        success: "var(--c-success)",
        danger: "var(--c-danger)",
        "danger-soft": "var(--c-danger-soft)",
      },
      boxShadow: {
        token_sm: "var(--shadow-sm)",
        token_md: "var(--shadow-md)",
        token_lg: "var(--shadow-lg)",
      },
      borderRadius: {
        token_sm: "var(--r-sm)",
        token_md: "var(--r-md)",
        token_lg: "var(--r-lg)",
        token_pill: "var(--r-pill)",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Helvetica", "Arial", "sans-serif"],
        display: ["'Cormorant Garamond'", "serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: 0, transform: "translateY(20px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
        orbFloat: {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.07)" },
        },
        wmIconFloat: {
          "0%, 100%": { transform: "translateY(-50%) scale(1)", opacity: 0.55 },
          "50%": { transform: "translateY(calc(-50% - 18px)) scale(1.04)", opacity: 0.65 },
        },
        wmTextFloat: {
          "0%, 100%": { transform: "translateY(-50%) scale(1)", opacity: 0.75 },
          "50%": { transform: "translateY(calc(-50% - 14px)) scale(1.03)", opacity: 0.95 },
        },
        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.4, transform: "scale(0.7)" },
        },
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        dropdownFadeIn: {
          "0%": { opacity: 0, transform: "translateY(-4px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        fadeUp: "fadeUp 0.5s ease both",
        orbFloat1: "orbFloat 9s ease-in-out infinite",
        orbFloat2: "orbFloat 11s ease-in-out infinite reverse",
        orbFloat3: "orbFloat 7s ease-in-out infinite 2s",
        wmIconFloat: "wmIconFloat 6s ease-in-out infinite",
        wmTextFloat: "wmTextFloat 6s ease-in-out infinite 1s",
        pulseDot: "pulseDot 1.6s ease-in-out infinite",
        fadeIn: "fadeIn 0.2s ease",
        dropdownFadeIn: "dropdownFadeIn 0.15s ease-out",
      },
    },
  },
  plugins: [],
};
