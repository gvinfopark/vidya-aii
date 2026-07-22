import React, { useState } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { auth, saveSession, ensureDefaultGroqKey } from "../../services/api";

import vidyaIcon from "../../assets/vidya_icon.png";
import vidyaText from "../../assets/vidya_text.png";

const PARTNERS = [
  { name: "Partner One", tagline: "Official Learning Partner" },
  { name: "Partner Two", tagline: "Content & Curriculum Partner" },
  { name: "Partner Three", tagline: "Community Outreach Partner" },
];

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) {
      setError("Please enter your credentials.");
      return;
    }
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email format.");
      return;
    }
    if (password.length < 4) {
      setError("Password too short.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const data = await auth.login({ email, password });
      saveSession(data.access_token, data.user);
      localStorage.setItem("token", data.access_token);
      ensureDefaultGroqKey();
      onLogin(data.user.name || email.split("@")[0] || "Student");
      navigate("/vidya");
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const profileRes = await fetch(
          "https://www.googleapis.com/oauth2/v3/userinfo",
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
          },
        );
        const profile = await profileRes.json();
        const data = await auth.google({
          name: profile.name,
          email: profile.email,
          google_id: profile.sub,
        });
        saveSession(data.access_token, data.user);
        localStorage.setItem("token", data.access_token);
        ensureDefaultGroqKey();
        onLogin(data.user.name || "Google User");
        navigate("/vidya");
      } catch (err) {
        setError("Google Login failed.");
      }
    },
    onError: () => setError("Google Login failed."),
  });

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg p-4 sm:p-6 relative gap-8">
      <ThemeToggle className="fixed top-3 right-3 sm:top-5 sm:right-5" />

      {/* Main Login form */}
      <div className="w-full max-w-[400px] flex flex-col gap-4 bg-surface border border-border rounded-token_lg shadow-token_md p-6 sm:p-9 animate-fadeUp z-10">
        {/* CHANGED: Header area now has the logo to the left of the text */}
        <div className="flex items-center gap-4 mb-2">
          <div className="flex flex-col items-center shrink-0">
            <img
              src={vidyaIcon}
              alt="Vidhya"
              className="w-11 h-11 object-contain block"
            />
          </div>
          <div className="flex flex-col">
            <h1 className="font-sans text-2xl sm:text-[26px] font-bold text-text leading-tight text-left">
              Welcome back
            </h1>
            <p className="text-sm text-text-muted mt-0.5 text-left">
              Log in to continue to Vidhya
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-danger-soft border border-danger rounded-lg px-3.5 py-2.5 text-[13px] text-danger font-medium">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted">
            Email address
          </label>
          <input
            className="w-full px-3.5 py-3 rounded-[10px] border border-border bg-bg text-[15px] text-text font-sans outline-none transition-colors placeholder:text-text-faint focus:border-accent focus:bg-surface"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-text-muted">
            Password
          </label>
          <input
            className="w-full px-3.5 py-3 rounded-[10px] border border-border bg-bg text-[15px] text-text font-sans outline-none transition-colors placeholder:text-text-faint focus:border-accent focus:bg-surface"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSubmit();
            }}
          />
        </div>

        <button
          className="w-full py-3.5 rounded-[10px] bg-primary text-primary-text text-[15px] font-semibold border-none cursor-pointer font-sans transition-colors mt-1 flex justify-center items-center hover:enabled:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Signing in…" : "Continue"}
        </button>

        <div className="flex items-center gap-3 text-text-faint text-xs font-semibold my-0.5 before:content-[''] before:flex-1 before:h-px before:bg-border after:content-[''] after:flex-1 after:h-px after:bg-border">
          OR
        </div>

        <button
          className="w-full bg-surface border border-border text-text py-3.5 rounded-[10px] text-[15px] font-semibold cursor-pointer font-sans transition-colors flex justify-center items-center gap-2 hover:bg-bg-tertiary"
          onClick={() => googleLogin()}
        >
          <svg width="18" height="18" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
            />
            <path
              fill="#FF3D00"
              d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
            />
            <path
              fill="#4CAF50"
              d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
            />
            <path
              fill="#1976D2"
              d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
            />
          </svg>
          Continue with Google
        </button>

        <div className="text-center text-sm text-text-muted mt-1">
          New to Vidhya?{" "}
          <button
            className="bg-transparent border-none text-accent-text text-sm font-semibold cursor-pointer font-sans p-0 transition-opacity hover:opacity-75"
            onClick={() => navigate("/signup")}
          >
            Create an account
          </button>
        </div>

        <div className="text-center">
          <button
            className="bg-transparent border-none text-text-faint text-xs cursor-pointer underline font-sans"
            onClick={() => navigate("/admin")}
          >
            Admin login
          </button>
        </div>
      </div>

      {/* CHANGED: Sponsored Partners section moved below the login form */}
      <div className="w-full max-w-[400px] animate-fadeUp">
        <div className="text-[11px] uppercase tracking-wider text-text-faint font-bold mb-3 text-center">
          Our Sponsored Partners
        </div>
        <div className="relative overflow-hidden partner-fade-x">
          <div className="partner-scroll-x flex items-center gap-10 w-max mx-auto">
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <span
                key={`${p.name}-${i}`}
                className="text-sm sm:text-base font-semibold text-text-muted whitespace-nowrap"
              >
                {p.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes partnerScrollX {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .partner-scroll-x {
          animation: partnerScrollX ${PARTNERS.length * 5}s linear infinite;
        }
        .partner-fade-x {
          mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0, #000 24px, #000 calc(100% - 24px), transparent 100%);
        }
      `}</style>
    </div>
  );
}
