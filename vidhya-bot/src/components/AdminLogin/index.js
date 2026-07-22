import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { auth, saveSession, ensureDefaultGroqKey } from "../../services/api";

import vidyaIcon from "../../assets/vidya_icon.png";

export default function AdminLogin({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !password) { setError("Please enter your admin credentials."); return; }
    if (!emailRegex.test(email)) { setError("Please enter a valid email format."); return; }

    setError("");
    setLoading(true);
    try {
      const data = await auth.adminLogin({ email, password });
      saveSession(data.access_token, data.user);
      // AdminDashboard reads the plain "token" key directly.
      localStorage.setItem("token", data.access_token);
      ensureDefaultGroqKey();
      onLogin(data.user.name || "Admin");
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message || "Admin authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 sm:p-6 relative">
      <ThemeToggle className="fixed top-3 right-3 sm:top-5 sm:right-5" />

      <div className="w-full max-w-[400px] bg-surface border border-border rounded-token_lg shadow-token_md p-6 sm:p-9">
        <img src={vidyaIcon} alt="Vidhya" className="w-11 h-11 object-contain mx-auto mb-1 block" />
        <h2 className="font-sans text-xl sm:text-2xl font-bold text-text flex items-center justify-center mb-1.5">
          <ShieldCheck size={20} style={{ verticalAlign: "-4px", marginRight: 8 }} />Admin access
        </h2>
        <p className="text-text-muted text-sm text-center mb-6">Strictly for authorized personnel.</p>

        {error && (
          <div className="bg-danger-soft border border-danger rounded-lg px-3.5 py-2.5 text-[13px] text-danger font-medium mb-4">{error}</div>
        )}

        <div className="mb-[18px]">
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Admin email</label>
          <input
            className="w-full px-3.5 py-3 border border-border rounded-[10px] bg-bg font-sans text-[15px] text-text outline-none transition-colors focus:border-accent focus:bg-surface"
            type="email" placeholder="admin@vidhya.com" value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} />
        </div>

        <div className="mb-[18px]">
          <label className="block text-xs font-semibold text-text-muted mb-1.5">Security key / password</label>
          <input
            className="w-full px-3.5 py-3 border border-border rounded-[10px] bg-bg font-sans text-[15px] text-text outline-none transition-colors focus:border-accent focus:bg-surface"
            type="password" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") handleSubmit(); }} />
        </div>

        <button
          className="w-full py-3.5 bg-primary text-primary-text border-none rounded-[10px] font-sans text-[15px] font-semibold cursor-pointer transition-colors mt-1 hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          onClick={handleSubmit} disabled={loading}>
          {loading ? "Authenticating…" : "Authenticate"}
        </button>

        <div className="text-center mt-5 text-[13px] text-text-muted">
          Student instead?{" "}
          <button className="bg-transparent border-none text-accent-text font-semibold cursor-pointer text-[13px] font-sans" onClick={() => navigate("/login")}>Return to student portal</button>
        </div>
      </div>
    </div>
  );
}
