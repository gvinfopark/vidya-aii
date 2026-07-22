import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell } from "lucide-react";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import { notifications as notificationsApi } from "../../services/api";

// Premium Inline SVG definitions for professional look
const Icons = {
  // 👇 Added Home Icon definition
  Home: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
  ),
  MockTests: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  ),
  Flashcards: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 8h10"/><path d="M7 12h10"/><path d="M7 16h6"/></svg>
  ),
  Planner: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
  ),
  Analytics: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
  ),
  Book: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
  ),
  Progress: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4 4 4"/><path d="M4 20V10a6 6 0 0 1 12 0v10"/></svg>
  ),
  Logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
  ),
  ChevronDown: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
  )
};

const NAV = [
  // 👇 Added Home section right at the top
  {
    label: "Overview",
    items: [
      { icon: <Icons.Home />, label: "Home Dashboard", path: "/home" },
    ],
  },
  {
    label: "Practice",
    items: [
      { icon: <Icons.MockTests />, label: "Mock Tests", path: "/mock-tests" },
      { icon: <Icons.Flashcards />, label: "Flashcards", path: "/flashcards" },
      { icon: <Icons.Planner />, label: "Planner", path: "/study-planner" },
    ],
  },
  {
    label: "Curriculum",
    items: [
      { icon: <Icons.Book />, label: "CBSE Board", path: "/cbse" },
      { icon: <Icons.Book />, label: "State Board", path: "/state-board" },
      { icon: <Icons.Book />, label: "NEET", path: "/neet" },
      { icon: <Icons.Book />, label: "JEE", path: "/jee" },
      { icon: <Icons.Book />, label: "NCERT", path: "/ncert" },
    ],
  },
  {
    label: "Insights",
    items: [
      { icon: <Icons.Analytics />, label: "Analytics", path: "/analytics" },
      { icon: <Icons.Progress />, label: "Progress", path: "/progress" },
    ],
  },
];

export default function SideNav({ userName, onLogout, collapsed, setCollapsed }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [notifs, setNotifs] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    let cancelled = false;
    notificationsApi.list().then((data) => {
      if (!cancelled) setNotifs(data);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const handleMarkRead = async (id) => {
    try {
      await notificationsApi.markRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch { /* non-blocking */ }
  };

  const handleMarkAll = async () => {
    try {
      await notificationsApi.markAll();
      setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch { /* non-blocking */ }
  };

  const handleLogoClick = (e) => {
    if (e.target.closest('.brand-menu-trigger')) return;
    navigate("/home");
  };

  const navItemCls = (isActive) =>
    `flex items-center gap-3 w-full border-none bg-transparent rounded-token_sm cursor-pointer text-sm font-medium text-text-muted text-left transition-all hover:bg-bg-tertiary hover:text-text ${
      isActive ? "!bg-accent-soft !text-accent-text font-semibold" : ""
    } ${collapsed ? "justify-center py-2.5 px-0" : "py-2.5 px-3"}`;

  const dropdownItemCls = "w-full text-left py-2 px-2.5 bg-transparent border-none rounded-md text-text-muted text-[13px] font-medium cursor-pointer font-sans transition-all hover:bg-bg-tertiary hover:text-text";

  return (
    <>
      {!collapsed && (
        <div
          className="fixed inset-0 z-[150] bg-[rgba(20,18,12,0.4)] animate-fadeIn"
          onClick={() => setCollapsed(true)}
          aria-hidden="true"
        />
      )}

      {/* Hamburger toggle — rendered outside <aside> so it's never clipped by
          the aside's width:0/overflow-hidden when the sidebar is collapsed. */}
      {collapsed && (
        <button
          className="fixed top-5 left-4 z-[999] bg-surface border border-border text-text-muted w-[34px] h-[34px] rounded-token_sm flex items-center justify-center cursor-pointer shadow-token_sm transition-colors hover:bg-accent-soft hover:text-accent-text hover:border-accent"
          onClick={() => setCollapsed(false)}
          title="Open Menu"
        >
          <Menu size={16} />
        </button>
      )}

      <aside
        className={`flex flex-col items-start justify-between h-screen bg-bg-secondary border-r border-border box-border fixed top-0 left-0 z-[1000] font-sans transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] shadow-token_lg ${
          collapsed
            ? "w-0 p-0 border-r-0 overflow-hidden"
            : "w-[min(260px,82vw)] md:w-[min(230px,84vw)] sm:w-[min(300px,86vw)] max-[420px]:w-screen py-5 px-3"
        }`}
      >

      {/* TOP: Branding Header */}
      <div
        ref={menuRef}
        className={`flex items-center w-full mb-7 box-border relative transition-[padding] duration-300 ${
          collapsed ? "flex-col-reverse gap-4 justify-center p-0" : "justify-between py-1 px-1.5"
        }`}
      >
        <div className="flex items-center gap-2.5 relative cursor-pointer" onClick={handleLogoClick} title="Go to Home">
          <div className="relative inline-flex items-center">
            <img
              src={require("../../assets/vidya_icon.png")}
              alt="Vidya Icon"
              className="h-[34px] w-auto shrink-0 rounded-lg"
            />
            <button
              className={`brand-menu-trigger absolute -bottom-0.5 -right-1.5 w-[18px] h-[18px] bg-surface border border-border-strong rounded-full text-text-muted flex items-center justify-center cursor-pointer transition-all z-[5] shadow-token_sm ${menuOpen ? "!opacity-100 !scale-100" : "opacity-0 scale-[0.8]"} hover:!bg-accent hover:!text-white hover:!border-accent`}
              onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              title="Brand Options"
            >
              <Icons.ChevronDown />
            </button>
          </div>

          {!collapsed && (
            <img
              src={require("../../assets/vidya_text.png")}
              alt="Vidya Text Logo"
              className="h-[54px] w-auto transition-opacity"
            />
          )}

          {/* Context Options Dropdown Menu */}
          {menuOpen && (
            <div
              className={`absolute w-[180px] bg-surface border border-border rounded-token_md p-1.5 shadow-token_lg flex flex-col gap-0.5 z-[200] animate-dropdownFadeIn ${
                collapsed ? "left-[52px] top-0" : "top-11 left-0"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wider text-text-faint font-bold py-1.5 px-2">Vidya Platform</div>
              <button className={dropdownItemCls} onClick={() => { navigate("/vidya"); setMenuOpen(false); }}>
                Ask AI Tutor
              </button>
              <button className={dropdownItemCls} onClick={() => { navigate("/study-planner"); setMenuOpen(false); }}>
                View Planner
              </button>
              <div className="h-px bg-border my-1" />
              <button className={`${dropdownItemCls} !text-danger hover:!bg-danger-soft`} onClick={() => { onLogout(); setMenuOpen(false); }}>
                Quick Sign Out
              </button>
            </div>
          )}
        </div>

        {/* Right-side action cluster: notifications + hamburger, kept together and aligned */}
        <div className="flex items-center gap-2 shrink-0">
        {!collapsed && (
        <div className="relative flex" ref={notifRef}>
          <button
            className="relative bg-surface border border-border text-text-muted w-[34px] h-[34px] rounded-token_sm flex items-center justify-center cursor-pointer shrink-0 shadow-token_sm transition-colors hover:bg-accent-soft hover:text-accent-text hover:border-accent"
            onClick={() => setNotifOpen((o) => !o)}
            title="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-[#c0392b] border-[1.5px] border-surface" />
            )}
          </button>
          {notifOpen && (
            <div className="absolute top-11 right-0 left-auto w-[min(280px,88vw)] max-h-[340px] overflow-y-auto overflow-x-hidden bg-surface border border-border rounded-token_md p-1.5 shadow-token_lg flex flex-col gap-0.5 z-[200] animate-dropdownFadeIn">
              <div className="text-[10px] uppercase tracking-wider text-text-faint font-bold py-1.5 px-2 flex justify-between items-center">
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <button onClick={handleMarkAll} className="bg-transparent border-none text-accent-text text-[11px] font-bold cursor-pointer p-0">
                    Mark all read
                  </button>
                )}
              </div>
              {notifs.length === 0 && (
                <div className="py-3.5 px-4 text-xs text-text-muted">No notifications yet.</div>
              )}
              {notifs.slice(0, 15).map((n) => (
                <button
                  key={n.id}
                  onClick={() => !n.read && handleMarkRead(n.id)}
                  className={`block w-full text-left py-2.5 px-4 border-none border-b border-border last:border-b-0 ${n.read ? "bg-transparent cursor-default" : "bg-bg-tertiary cursor-pointer"}`}
                >
                  <div className="text-[12.5px] font-bold text-text break-words">{n.title}</div>
                  <div className="text-[11.5px] text-text-muted mt-0.5 break-words">{n.message}</div>
                </button>
              ))}
            </div>
          )}
        </div>
        )}

        {/* Close Toggle Button (visible while sidebar is expanded) */}
        <button
          className="relative bg-surface border border-border text-text-muted w-[34px] h-[34px] rounded-token_sm flex items-center justify-center cursor-pointer text-[11px] shrink-0 z-[999] shadow-token_sm transition-colors hover:bg-accent-soft hover:text-accent-text hover:border-accent"
          onClick={() => setCollapsed(true)}
          title="Close Menu"
        >
          <X size={16} />
        </button>
        </div>
      </div>

      {/* MIDDLE: Vertical Navigation Links */}
      <div className="flex flex-col gap-5 w-full flex-1 overflow-y-auto">
        {NAV.map((section) => (
          <div key={section.label} className="flex flex-col gap-1.5 w-full">
            {!collapsed && <span className="text-[11px] uppercase tracking-wider text-text-faint font-bold pl-2.5">{section.label}</span>}

            <div className="flex flex-col gap-0.5 w-full">
              {section.items.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <button
                    key={item.path}
                    className={navItemCls(isActive)}
                    onClick={() => navigate(item.path)}
                    title={item.label}
                  >
                    <span className="inline-flex items-center justify-center w-[22px] h-[22px] shrink-0">{item.icon}</span>
                    {!collapsed && <span>{item.label}</span>}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* BOTTOM: Profile and Actions */}
      <div className="flex flex-col gap-3 w-full pt-3.5 border-t border-border">
        <div className={`flex items-center gap-2.5 ${collapsed ? "pl-0 justify-center" : "pl-1"}`}>
          <div className="w-[34px] h-[34px] rounded-full bg-accent text-white flex items-center justify-center font-bold text-[13px] shrink-0">{userName?.[0]?.toUpperCase() || "S"}</div>
          {!collapsed && (
            <div className="flex flex-col">
              <div className="text-[13px] font-semibold text-text whitespace-nowrap overflow-hidden text-ellipsis max-w-[140px]">{userName || "ssuresh96153"}</div>
              <div className="text-[11px] text-text-faint">Student</div>
            </div>
          )}
          {!collapsed && <ThemeToggle className="ml-auto" />}
        </div>
        {collapsed && <ThemeToggle className="self-center mb-1" />}
        <button
          className={`w-full border border-border bg-transparent text-text-muted text-[13px] font-medium cursor-pointer flex items-center justify-center gap-2 transition-all rounded-token_sm hover:bg-danger-soft hover:text-danger hover:border-danger ${
            collapsed ? "!border-none w-[38px] h-[38px] p-0 self-center" : "py-2.5"
          }`}
          onClick={onLogout} title="Sign Out">
          <Icons.Logout />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      </aside>
    </>
  );
}