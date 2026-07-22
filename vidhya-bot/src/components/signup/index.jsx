import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Rocket } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { auth, saveSession, ensureDefaultGroqKey } from "../../services/api";
import vidyaLogo from "../../assets/vidya_icon.png";

const inputCls = "w-full px-3.5 py-3 rounded-[10px] border border-border bg-bg text-[15px] text-text font-sans outline-none transition-colors placeholder:text-text-faint focus:border-accent focus:bg-surface";
const labelCls = "text-xs font-semibold text-text-muted";
const groupCls = "flex flex-col gap-1.5";

export default function Signup({ onLogin }) {
  const [name,             setName]             = useState("");
  const [email,            setEmail]            = useState("");
  const [mobile,           setMobile]           = useState("");
  const [educationLevel,   setEducationLevel]   = useState("");
  const [schoolClass,      setSchoolClass]      = useState("");
  const [schoolBoard,      setSchoolBoard]      = useState("");
  const [collegeDepartment,setCollegeDepartment]= useState("");
  const [password,         setPassword]         = useState("");
  const [error,            setError]            = useState("");
  const [loading,          setLoading]          = useState(false);
  const navigate = useNavigate();

  const handleEducationChange = (e) => {
    setEducationLevel(e.target.value);
    setSchoolClass(""); setSchoolBoard(""); setCollegeDepartment("");
  };

  const getTargetExam = () => {
    if (educationLevel === "neet")    return "NEET";
    if (educationLevel === "jee")     return "JEE_MAINS";
    if (educationLevel === "college") return "OTHER";
    return "BOARDS";
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name || !email || !mobile || !password || !educationLevel) {
      setError("Please fill in all required fields."); return;
    }
    if (educationLevel === "school" && (!schoolClass || !schoolBoard)) {
      setError("Please select your syllabus and class."); return;
    }
    if (educationLevel === "college" && !collegeDepartment) {
      setError("Please select your department."); return;
    }
    if (!/^[0-9]{10}$/.test(mobile)) {
      setError("Please enter a valid 10-digit mobile number."); return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters."); return;
    }

    setError("");
    setLoading(true);

    try {
      const data = await auth.signup({
        name,
        email       : email.toLowerCase(),
        password,
        target_exam : getTargetExam(),
      });
      saveSession(data.access_token, data.user);
      localStorage.setItem("token", data.access_token);
      ensureDefaultGroqKey();
      if (onLogin) onLogin(data.user.name);
      navigate("/welcome");
    } catch (err) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 sm:p-6 relative">
      <ThemeToggle className="fixed top-3 right-3 sm:top-5 sm:right-5" />

      <div className="w-full max-w-[440px] flex flex-col gap-4 bg-surface border border-border rounded-token_lg shadow-token_md p-6 sm:p-9 max-h-[90vh] overflow-y-auto animate-fadeUp">
        <img src={vidyaLogo} alt="Vidhya" className="w-11 h-11 object-contain mx-auto mb-1 block" />
        <h1 className="font-sans text-2xl sm:text-[26px] font-bold text-text leading-tight text-center">Create your account</h1>
        <p className="text-sm text-text-muted -mt-3 text-center">Join Vidhya and start learning today</p>

        {error && (
          <div className="bg-danger-soft border border-danger rounded-lg px-3.5 py-2.5 text-[13px] text-danger font-medium">
            <AlertTriangle size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />{error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className={groupCls}>
            <label className={labelCls}>Full name</label>
            <input className={inputCls} placeholder="Enter your name"
              value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div className={groupCls}>
            <label className={labelCls}>Email address</label>
            <input className={inputCls} type="email" placeholder="you@example.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className={groupCls}>
            <label className={labelCls}>Mobile number</label>
            <input className={inputCls} type="tel" placeholder="10-digit number"
              value={mobile}
              onChange={e => setMobile(e.target.value.replace(/\D/g, ""))}
              maxLength="10" />
          </div>

          <div className={groupCls}>
            <label className={labelCls}>Studying for</label>
            <select className={inputCls} value={educationLevel}
              onChange={handleEducationChange}>
              <option value="" disabled>Select an option</option>
              <option value="school">School (Class 6–12)</option>
              <option value="college">College</option>
              <option value="neet">NEET</option>
              <option value="jee">JEE</option>
            </select>
          </div>

          {educationLevel === "school" && (
            <>
              <div className={`${groupCls} animate-fadeUp`}>
                <label className={labelCls}>Syllabus</label>
                <select className={inputCls} value={schoolBoard}
                  onChange={e => setSchoolBoard(e.target.value)}>
                  <option value="" disabled>Choose syllabus</option>
                  <option value="cbse">CBSE</option>
                  <option value="tn_state">TN State Syllabus</option>
                </select>
              </div>
              <div className={`${groupCls} animate-fadeUp`}>
                <label className={labelCls}>Class</label>
                <select className={inputCls} value={schoolClass}
                  onChange={e => setSchoolClass(e.target.value)}>
                  <option value="" disabled>Choose class</option>
                  {["6th","7th","8th","9th","10th","11th","12th"].map(c =>
                    <option key={c} value={c}>{c} Standard</option>
                  )}
                </select>
              </div>
            </>
          )}

          {educationLevel === "college" && (
            <div className={`${groupCls} animate-fadeUp`}>
              <label className={labelCls}>Department</label>
              <select className={inputCls} value={collegeDepartment}
                onChange={e => setCollegeDepartment(e.target.value)}>
                <option value="" disabled>Choose department</option>
                <option value="engineering">Engineering / Technology</option>
                <option value="arts_science">Arts &amp; Science</option>
                <option value="commerce">Commerce / Management</option>
                <option value="medical">Medical / Health Sciences</option>
                <option value="law">Law</option>
              </select>
            </div>
          )}

          <div className={groupCls}>
            <label className={labelCls}>Password</label>
            <input className={inputCls} type="password" placeholder="Min 6 characters"
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-[10px] bg-primary text-primary-text text-[15px] font-semibold border-none cursor-pointer font-sans transition-colors mt-1 flex justify-center items-center hover:enabled:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}>
            {loading ? "Creating account…" : <>Create free account <Rocket size={15} style={{ verticalAlign: "-2px", marginLeft: 4 }} /></>}
          </button>
        </form>

        <div className="text-center text-sm text-text-muted mt-1">
          Already have an account?{" "}
          <button className="bg-transparent border-none text-accent-text text-sm font-semibold cursor-pointer font-sans p-0 transition-opacity hover:opacity-75" onClick={() => navigate("/login")}>Sign in</button>
        </div>
      </div>
    </div>
  );
}
