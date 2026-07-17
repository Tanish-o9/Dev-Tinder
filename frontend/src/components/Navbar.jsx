import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef(null);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  useEffect(() => {
    if (!moreOpen) return;
    const handler = (e) => {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [moreOpen]);

  if (!user) return null;

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();

  return (
    <>
      {/* ── Desktop / tablet top bar ── */}
      <nav className="navbar">
        <div className="navbar-inner">
          <Link to="/feed" className="navbar-brand">
            <span className="brand-icon">{"</>"}</span>
            <span className="brand-text">DevTinder</span>
          </Link>

          <div className="navbar-links">
            <NavLink to="/feed" end>Discover</NavLink>
            <NavLink to="/projects">Projects</NavLink>
            <NavLink to="/requests">Requests</NavLink>
            <NavLink to="/connections">Connections</NavLink>
            <NavLink to="/saved-developers">Saved</NavLink>
            <NavLink to="/chat">Chat</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </div>

          <div className="navbar-end">
            <NotificationBell />
            <div className="navbar-divider" />
            <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* ── Mobile bottom tab bar ── */}
      <nav className="bottom-nav" aria-label="Main navigation">
        <NavLink to="/feed" end className="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <span>Discover</span>
        </NavLink>

        <NavLink to="/projects" className="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
          </svg>
          <span>Projects</span>
        </NavLink>

        <NavLink to="/chat" className="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span>Chat</span>
        </NavLink>

        <NavLink to="/connections" className="bottom-nav-item">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          <span>Network</span>
        </NavLink>

        {/* More — houses Requests, Saved, Profile */}
        <div className="bottom-nav-more" ref={moreRef}>
          <button
            className={`bottom-nav-item${moreOpen ? " active" : ""}`}
            onClick={() => setMoreOpen((v) => !v)}
            aria-label="More navigation options"
            aria-expanded={moreOpen}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />
            </svg>
            <span>More</span>
          </button>

          {moreOpen && (
            <div className="bottom-nav-more-menu" role="menu">
              <NavLink to="/requests" className="more-menu-item" onClick={() => setMoreOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
                </svg>
                Requests
              </NavLink>
              <NavLink to="/saved-developers" className="more-menu-item" onClick={() => setMoreOpen(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                </svg>
                Saved
              </NavLink>
              <NavLink to="/profile" className="more-menu-item" onClick={() => setMoreOpen(false)}>
                <div className="bottom-nav-avatar" aria-hidden="true">
                  {user.photoURL ? (
                    <img src={user.photoURL} alt="" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </div>
                Profile
              </NavLink>
              <div className="more-menu-divider" />
              <button className="more-menu-item more-menu-logout" onClick={handleLogout}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </>
  );
}
