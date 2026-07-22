import React, { useState } from "react";
import { Link, useNavigate } from 'react-router-dom'; // Your existing imports
import "./index.css"; 

export default function Signup({ onLogin }) {
  const navigate = useNavigate();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSignup = (e) => {
  e.preventDefault();

  // 1. Email Format Pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 2. Check if fields are empty
  if (!name || !email || !password) {
    setError("Please fill in all fields.");
    return;
  }

  // 3. Validate Email Format
  if (!emailRegex.test(email)) {
    setError("Please enter a valid email address (e.g., name@domain.com).");
    return;
  }

  // 4. Validate Password Length
  if (password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }
  
  // Logic to save user
  setError("");
  setIsSuccess(true);
};
  if (isSuccess) {
    return (
      <div className="login-wrap" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
        <div className="login-card" style={{textAlign: 'center'}}>
          <h2>Welcome to the family! 🎉</h2>
          <p>Your account for <strong>vidya</strong> has been created. You can now close this tab and log in.</p>
          <button className="btn-primary" style={{marginTop: '20px'}} onClick={() => window.close()}>Close Tab</button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-wrap">
      <div className="login-left">
        <div className="brand-badge">
          <div className="brand-badge-dot" />
          <span>vidya</span>
        </div>
        <h1 className="login-headline">Start Your<br /><em>Success</em><br />Story.</h1>
        <p className="login-sub">Join thousands of students and get access to curated study materials, mock tests, and analytics.</p>
      </div>

      <div className="login-right">
        <div className="login-card animate-fadeUp">
          <h2>Create Account ✨</h2>
          <p className="subtitle">Join vidya and start learning today.</p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input 
                className="form-input" 
                placeholder="Enter your name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

           <div className="form-group">
  <label className="form-label">Email Address</label>
  <input 
    className="form-input" 
    type="email" 
    placeholder="student@example.com" 
    value={email}
    onChange={(e) => {
      const val = e.target.value;
      // This Regex removes any character that IS NOT a letter, number, @, ., _, or -
      const cleanedVal = val.replace(/[^a-zA-Z0-9@._-]/g, "");
      setEmail(cleanedVal);
    }}
  />
</div>

            <div className="form-group">
              <label className="form-label">Create Password</label>
              <input 
                className="form-input" 
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn-primary">Create Free Account 🚀</button>
          </form>
         <div className="signup-row">
  Already have an account? 
  <button 
    type="button" 
    onClick={() => navigate("/login")} // 👈 Use navigate here
    style={{ background: 'none', border: 'none', color: '#4285F4', cursor: 'pointer', textDecoration: 'underline' }}
  >
    Sign In instead
  </button>
</div>
        </div>
      </div>
    </div>
  );
}