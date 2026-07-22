import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import icon from "../../assets/vidya_icon.png"
import text from "../../assets/vidya_text.png"
import { Users, TrendingUp, ClipboardList, ShieldCheck, ArrowLeft, Menu, X, Pencil, Check, XCircle, Palette, FileQuestion, Layers, CalendarDays, Bell } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { admin } from "../../services/api";
import SiteContentTab from "./tabs/SiteContentTab";
import MockTestsTab from "./tabs/MockTestsTab";
import FlashcardsTab from "./tabs/FlashcardsTab";
import StudyPlansTab from "./tabs/StudyPlansTab";
import NotificationsTab from "./tabs/NotificationsTab";

const thCls = "bg-bg-secondary py-4 px-4 sm:px-6 text-left text-xs uppercase text-text-muted border-b border-border";
const tdCls = "py-3 px-3.5 sm:py-4 sm:px-6 border-b border-border text-text text-[13px] sm:text-sm align-middle";
const actionBtnCls = "py-1.5 px-3 rounded font-medium text-xs cursor-pointer border-none";
const editInputCls = "py-1 px-2 rounded border border-border bg-bg text-text text-[13px] w-full max-w-[160px]";
const iconBtnCls = "p-1.5 rounded cursor-pointer border-none inline-flex items-center justify-center";
const LEGACY_DATA_TABS = ["users", "progress", "tests", "access"];

export default function AdminDashboard({ userName, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("users");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const [users, setUsers] = useState([]);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ── Inline editing state ──────────────────────────────────────────
  const [editingUserId, setEditingUserId] = useState(null);
  const [userDraft, setUserDraft] = useState({ name: "", email: "", progress: 0 });
  const [editingTestId, setEditingTestId] = useState(null);
  const [testDraftScore, setTestDraftScore] = useState(0);
  const [savingId, setSavingId] = useState(null);

  const handleLogout = () => {
    // Clear all session tokens so nobody else can use them
    localStorage.removeItem("token");
    localStorage.removeItem("vidhya_token");
    localStorage.removeItem("vidhya_user");
    onLogout();
    navigate("/admin");
  };

  const selectTab = (tab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await admin.listUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async () => {
    setLoading(true);
    try {
      const data = await admin.listTests();
      setTests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setError("");
    if (activeTab === "tests") {
      fetchTests();
    } else if (LEGACY_DATA_TABS.includes(activeTab)) {
      fetchUsers();
    }
  }, [activeTab]);

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "Active" ? "Suspended" : "Active";
    try {
      await admin.updateStatus(userId, newStatus);
      setUsers(users.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert("Failed to update user status.");
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user completely?")) return;

    try {
      await admin.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
    } catch (err) {
      alert("Failed to delete user.");
    }
  };

  const startEditUser = (user) => {
    setEditingUserId(user.id);
    setUserDraft({ name: user.name || "", email: user.email || "", progress: user.progress || 0 });
  };

  const cancelEditUser = () => setEditingUserId(null);

  const saveEditUser = async (userId) => {
    setSavingId(userId);
    try {
      const updated = await admin.updateUser(userId, {
        name: userDraft.name.trim(),
        email: userDraft.email.trim(),
        progress: Number(userDraft.progress),
      });
      setUsers(users.map(u => u.id === userId ? { ...u, ...updated } : u));
      setEditingUserId(null);
    } catch (err) {
      alert(err.message || "Failed to update user.");
    } finally {
      setSavingId(null);
    }
  };

  const startEditTest = (test) => {
    setEditingTestId(test.id);
    setTestDraftScore(test.score || 0);
  };

  const cancelEditTest = () => setEditingTestId(null);

  const saveEditTest = async (attemptId) => {
    setSavingId(attemptId);
    try {
      const score = Math.max(0, Math.min(100, Number(testDraftScore)));
      await admin.updateTestScore(attemptId, score);
      setTests(tests.map(t => t.id === attemptId ? { ...t, score } : t));
      setEditingTestId(null);
    } catch (err) {
      alert(err.message || "Failed to update score.");
    } finally {
      setSavingId(null);
    }
  };

  const navBtnCls = (tab) =>
    `bg-transparent text-text-muted border-none py-3 px-4 text-left rounded-lg text-[15px] font-medium cursor-pointer transition-all flex items-center gap-3 hover:bg-bg-tertiary hover:text-text ${
      activeTab === tab ? "!bg-danger-soft !text-danger border-l-4 border-danger" : ""
    }`;

  return (
    <div className="flex h-screen bg-bg font-sans relative overflow-hidden md:overflow-visible md:relative">
      {/* Mobile hamburger toggle */}
      <button
        className="md:hidden flex fixed top-4 left-4 z-[220] w-[38px] h-[38px] items-center justify-center bg-surface border border-border rounded-lg text-text-muted cursor-pointer shadow-token_sm"
        onClick={() => setSidebarOpen(v => !v)}
        title={sidebarOpen ? "Close menu" : "Open menu"}
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-[199] bg-[rgba(20,18,12,0.4)]" onClick={() => setSidebarOpen(false)} aria-hidden="true" />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-[100dvh] w-[min(280px,86vw)] z-[210] shadow-token_lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          md:static md:translate-x-0 md:h-screen md:shadow-none md:w-[220px] lg:w-[260px]
          bg-bg-secondary text-text flex flex-col shrink-0 border-r border-border
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="p-6 lg:p-[22px] border-b border-border flex items-center gap-3">
          <img src={icon} className="h-[50px] lg:h-20 w-auto object-contain block" alt="Vidya Icon"/>
          <img src={text} className="h-[100px] lg:h-20 w-auto object-contain block" alt="Vidya Text Logo"/>
        </div>
        <nav className="flex flex-col py-5 px-3 gap-2 flex-grow">
          <button className={navBtnCls("users")} onClick={() => selectTab("users")}><Users size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />User Management</button>
          <button className={navBtnCls("progress")} onClick={() => selectTab("progress")}><TrendingUp size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />User Progress</button>
          <button className={navBtnCls("tests")} onClick={() => selectTab("tests")}><ClipboardList size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Test Results</button>
          <button className={navBtnCls("access")} onClick={() => selectTab("access")}><ShieldCheck size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Access Logs</button>
          <div className="h-px bg-border my-2" />
          <button className={navBtnCls("content")} onClick={() => selectTab("content")}><Palette size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Site Content</button>
          <button className={navBtnCls("mocktests")} onClick={() => selectTab("mocktests")}><FileQuestion size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Mock Tests</button>
          <button className={navBtnCls("flashcards")} onClick={() => selectTab("flashcards")}><Layers size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Flashcards</button>
          <button className={navBtnCls("studyplans")} onClick={() => selectTab("studyplans")}><CalendarDays size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Study Plans</button>
          <button className={navBtnCls("notifications")} onClick={() => selectTab("notifications")}><Bell size={15} style={{ verticalAlign: "-3px", marginRight: 6 }} />Notifications</button>
        </nav>
        <div className="p-5 border-t border-border">
          <div className="text-[13px] text-text-muted mb-3">Logged in as: <strong className="text-text">{userName || "Admin"}</strong></div>
          <button className="w-full py-2.5 bg-transparent border border-danger text-danger rounded-md cursor-pointer transition-all hover:bg-danger hover:text-text-on-accent" onClick={handleLogout}><ArrowLeft size={14} style={{ verticalAlign: "-2px", marginRight: 6 }} />Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col overflow-hidden w-full md:w-full">
        <header className="min-h-[68px] md:h-20 bg-surface border-b border-border flex items-center justify-between flex-wrap gap-2 py-3 px-4 md:py-0 md:px-10 lg:px-[22px] pl-[60px] md:pl-10 shrink-0">
          <h1 className="text-[15px] sm:text-base md:text-xl text-text m-0">
            {activeTab === "users" && "User Management & Manipulation"}
            {activeTab === "progress" && "Overall Student Progress"}
            {activeTab === "tests" && "Recent Test Results"}
            {activeTab === "access" && "System Access Logs"}
            {activeTab === "content" && "Site Content & Theme"}
            {activeTab === "mocktests" && "Mock Test Question Bank"}
            {activeTab === "flashcards" && "Flashcard Management"}
            {activeTab === "studyplans" && "Study Plan Management"}
            {activeTab === "notifications" && "Notifications"}
          </h1>
          <div className="flex items-center gap-3">
            {activeTab === "users" && <button className="bg-danger text-text-on-accent border-none py-2 px-3.5 sm:px-5 rounded-md font-semibold cursor-pointer text-[13px] sm:text-sm hover:opacity-[0.88]">+ Add New User</button>}
            <ThemeToggle />
          </div>
        </header>

        <div className="m-3 sm:m-4 md:m-5 lg:m-[22px] xl:m-7 bg-surface rounded-xl shadow-token_sm overflow-y-auto flex-grow">
          {LEGACY_DATA_TABS.includes(activeTab) && loading && <p className="p-5">Loading data from server...</p>}
          {LEGACY_DATA_TABS.includes(activeTab) && error && <p className="p-5 text-red-600">Error: {error}</p>}

          {activeTab === "content" && <SiteContentTab />}
          {activeTab === "mocktests" && <MockTestsTab />}
          {activeTab === "flashcards" && <FlashcardsTab />}
          {activeTab === "studyplans" && <StudyPlansTab />}
          {activeTab === "notifications" && <NotificationsTab />}

          {/* TAB: User Management */}
          {!loading && activeTab === "users" && (
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[480px] sm:min-w-[560px]">
              <thead>
                <tr>
                  <th className={thCls}>Name</th><th className={thCls}>Email</th><th className={thCls}>Progress</th><th className={thCls}>Status</th><th className={thCls}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isEditing = editingUserId === user.id;
                  return (
                  <tr key={user.id} className="hover:bg-bg-secondary">
                    <td className={tdCls}>
                      {isEditing ? (
                        <input className={editInputCls} value={userDraft.name}
                          onChange={(e) => setUserDraft(d => ({ ...d, name: e.target.value }))} />
                      ) : <strong>{user.name}</strong>}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <input className={editInputCls} type="email" value={userDraft.email}
                          onChange={(e) => setUserDraft(d => ({ ...d, email: e.target.value }))} />
                      ) : user.email}
                    </td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <input className={`${editInputCls} max-w-[80px]`} type="number" min="0" max="100" value={userDraft.progress}
                          onChange={(e) => setUserDraft(d => ({ ...d, progress: e.target.value }))} />
                      ) : `${user.progress || 0}%`}
                    </td>
                    <td className={tdCls}>
                      <span className={`py-1 px-2.5 rounded-full text-xs font-semibold ${user.status?.toLowerCase() === "suspended" ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                        {user.status || 'Active'}
                      </span>
                    </td>
                    <td className={`${tdCls} flex gap-2 flex-wrap items-center`}>
                      {isEditing ? (
                        <>
                          <button className={`${iconBtnCls} bg-green-100 text-green-700`} title="Save" disabled={savingId === user.id} onClick={() => saveEditUser(user.id)}><Check size={14} /></button>
                          <button className={`${iconBtnCls} bg-bg-tertiary text-text-muted`} title="Cancel" onClick={cancelEditUser}><XCircle size={14} /></button>
                        </>
                      ) : (
                        <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title="Edit" onClick={() => startEditUser(user)}><Pencil size={14} /></button>
                      )}
                      <button className={`${actionBtnCls} bg-amber-100 text-amber-700`} onClick={() => toggleUserStatus(user.id, user.status || 'Active')}>
                        {user.status === "Active" || !user.status ? "Suspend" : "Activate"}
                      </button>
                      <button className={`${actionBtnCls} bg-red-100 text-red-600`} onClick={() => deleteUser(user.id)}>Delete</button>
                    </td>
                  </tr>
                  );
                })}
                {users.length === 0 && <tr><td className={tdCls} colSpan="5">No users found in database.</td></tr>}
              </tbody>
            </table>
            </div>
          )}

          {/* TAB: User Progress */}
          {!loading && activeTab === "progress" && (
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[480px] sm:min-w-[560px]">
              <thead>
                <tr><th className={thCls}>Student Name</th><th className={thCls}>Course Completion</th><th className={thCls}>Status</th><th className={thCls}>Actions</th></tr>
              </thead>
              <tbody>
                {users.map(user => {
                  const isEditing = editingUserId === user.id;
                  return (
                  <tr key={user.id} className="hover:bg-bg-secondary">
                    <td className={tdCls}><strong>{user.name}</strong></td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <input className={`${editInputCls} max-w-[80px]`} type="number" min="0" max="100" value={userDraft.progress}
                          onChange={(e) => setUserDraft(d => ({ ...d, progress: e.target.value }))} />
                      ) : (
                        <>
                          <div className="w-[150px] h-2 bg-bg-tertiary rounded mb-1">
                            <div className="h-full rounded" style={{ width: `${user.progress || 0}%`, backgroundColor: (user.progress || 0) > 75 ? '#22c55e' : '#3b82f6' }}></div>
                          </div>
                          <span className="text-[11px] text-text-muted">{user.progress || 0}% Completed</span>
                        </>
                      )}
                    </td>
                    <td className={tdCls}>{(user.progress || 0) > 50 ? "On Track" : "Needs Attention"}</td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button className={`${iconBtnCls} bg-green-100 text-green-700`} title="Save" disabled={savingId === user.id} onClick={() => saveEditUser(user.id)}><Check size={14} /></button>
                          <button className={`${iconBtnCls} bg-bg-tertiary text-text-muted`} title="Cancel" onClick={cancelEditUser}><XCircle size={14} /></button>
                        </div>
                      ) : (
                        <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title="Edit" onClick={() => startEditUser(user)}><Pencil size={14} /></button>
                      )}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          )}

          {/* TAB: Test Results */}
          {!loading && activeTab === "tests" && (
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[480px] sm:min-w-[560px]">
              <thead>
                <tr><th className={thCls}>Student Name</th><th className={thCls}>Test Name</th><th className={thCls}>Score</th><th className={thCls}>Date Taken</th><th className={thCls}>Actions</th></tr>
              </thead>
              <tbody>
                {tests.map(test => {
                  const isEditing = editingTestId === test.id;
                  return (
                  <tr key={test.id} className="hover:bg-bg-secondary">
                    <td className={tdCls}><strong>{test.user_name || test.user}</strong></td>
                    <td className={tdCls}>{test.test_name || test.test}</td>
                    <td className={`${tdCls} font-bold`}>
                      {isEditing ? (
                        <input className={`${editInputCls} max-w-[80px]`} type="number" min="0" max="100" value={testDraftScore}
                          onChange={(e) => setTestDraftScore(e.target.value)} />
                      ) : `${test.score}%`}
                    </td>
                    <td className={tdCls}>{new Date(test.date).toLocaleDateString()}</td>
                    <td className={tdCls}>
                      {isEditing ? (
                        <div className="flex gap-2">
                          <button className={`${iconBtnCls} bg-green-100 text-green-700`} title="Save" disabled={savingId === test.id} onClick={() => saveEditTest(test.id)}><Check size={14} /></button>
                          <button className={`${iconBtnCls} bg-bg-tertiary text-text-muted`} title="Cancel" onClick={cancelEditTest}><XCircle size={14} /></button>
                        </div>
                      ) : (
                        <button className={`${iconBtnCls} bg-blue-100 text-blue-700`} title="Edit" onClick={() => startEditTest(test)}><Pencil size={14} /></button>
                      )}
                    </td>
                  </tr>
                  );
                })}
                {tests.length === 0 && <tr><td className={tdCls} colSpan="5">No test results found in database.</td></tr>}
              </tbody>
            </table>
            </div>
          )}

          {/* TAB: Access Logs */}
          {!loading && activeTab === "access" && (
            <div className="w-full overflow-x-auto">
            <table className="w-full border-collapse min-w-[480px] sm:min-w-[560px]">
              <thead>
                <tr><th className={thCls}>User Email</th><th className={thCls}>Last Login Timestamp</th><th className={thCls}>IP / Location</th></tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-bg-secondary">
                    <td className={tdCls}>{user.email}</td>
                    <td className={tdCls}>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never logged in"}</td>
                    <td className={tdCls}>{user.ipAddress || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}