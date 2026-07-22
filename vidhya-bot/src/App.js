import React, { useState, Suspense, lazy } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SiteContentProvider } from './context/SiteContentContext';

// ── Lazy-loaded route components ──────────────────────────────────────────
// Splitting each route into its own chunk means the browser only downloads
// the code for the page the user is actually on, instead of the whole app
// up front. This cuts the initial JS payload significantly.
const Login         = lazy(() => import('./components/Login'));
const AdminLogin    = lazy(() => import('./components/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const Signup        = lazy(() => import('./components/signup'));
const Welcome       = lazy(() => import('./components/Welcome'));
const Home          = lazy(() => import('./components/Home'));
const NEETSyllabus  = lazy(() => import('./components/pages/NEETSyllabus'));
const JEEBooks      = lazy(() => import('./components/pages/Jeebooks'));
const NCERTBooks    = lazy(() => import('./components/pages/NCERTBooks'));
const CBSEBoard     = lazy(() => import('./components/pages/CBSEBoard'));
const StateBoard    = lazy(() => import('./components/pages/StateBoard'));
const MockTests     = lazy(() => import('./components/pages/MockTests'));
const Analytics     = lazy(() => import('./components/pages/Analytics'));
const Flashcards    = lazy(() => import('./components/pages/Flashcards'));
const StudyPlanner  = lazy(() => import('./components/pages/StudyPlanner'));
const Progress      = lazy(() => import('./components/pages/Progress'));
const VIDYAPage     = lazy(() => import('./components/pages/VIDYA'));

const GOOGLE_CLIENT_ID = "13111651638-rbfbn25jb9pf3ngbnvif4b07rgur8ur2.apps.googleusercontent.com";

function RouteLoader() {
  return (
    <div className="flex items-center justify-center h-screen text-text-muted text-sm">
      Loading…
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("vidhya_user");
    return saved ? JSON.parse(saved).name : null;
  });

  const handleLogin  = (name) => setUser(name);
  const handleLogout = () => {
    localStorage.removeItem("vidhya_token");
    localStorage.removeItem("vidhya_user");
    localStorage.removeItem("token");
    setUser(null);
  };

  // Protected route wrapper
  const P = ({ el }) => user ? el : <Navigate to="/login" />;

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <SiteContentProvider>
      <Router>
        <Suspense fallback={<RouteLoader />}>
        <Routes>
          {/* Root redirect goes straight to the VIDYA AI page once logged in */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/vidya" /> : <Navigate to="/login" />} 
          />

          {/* Public Routes */}
          <Route path="/login"         element={<Login       onLogin={handleLogin} />} />
          <Route path="/admin"         element={<AdminLogin onLogin={handleLogin} />} /> 
          <Route path="/signup"        element={<Signup     onLogin={handleLogin} />} />
          <Route path="/welcome"       element={<Welcome />} />

          {/* Protected Routes */}
          <Route path="/home"          element={<P el={<Home         userName={user} onLogout={handleLogout} />} />} />
          <Route path="/neet"          element={<P el={<NEETSyllabus userName={user} onLogout={handleLogout} />} />} />
          <Route path="/jee"           element={<P el={<JEEBooks     userName={user} onLogout={handleLogout} />} />} />
          <Route path="/ncert"         element={<P el={<NCERTBooks   userName={user} onLogout={handleLogout} />} />} />
          <Route path="/cbse"          element={<P el={<CBSEBoard    userName={user} onLogout={handleLogout} />} />} />
          <Route path="/state-board"   element={<P el={<StateBoard   userName={user} onLogout={handleLogout} />} />} />
          <Route path="/mock-tests"    element={<P el={<MockTests    userName={user} onLogout={handleLogout} />} />} />
          <Route path="/analytics"     element={<P el={<Analytics    userName={user} onLogout={handleLogout} />} />} />
          <Route path="/flashcards"    element={<P el={<Flashcards   userName={user} onLogout={handleLogout} />} />} />
          <Route path="/study-planner" element={<P el={<StudyPlanner userName={user} onLogout={handleLogout} />} />} />
          <Route path="/progress"      element={<P el={<Progress     userName={user} onLogout={handleLogout} />} />} />
          <Route path="/vidya"         element={<P el={<VIDYAPage    userName={user} onLogout={handleLogout} />} />} />
          
          {/* Admin Protected Dashboard */}
          <Route path="/admin-dashboard" element={<P el={<AdminDashboard userName={user} onLogout={handleLogout} />} />} />

          {/* Fallback Route */}
          <Route path="*"              element={<Navigate to="/login" />} />
        </Routes>
        </Suspense>
      </Router>
      </SiteContentProvider>
    </GoogleOAuthProvider>
  );
}