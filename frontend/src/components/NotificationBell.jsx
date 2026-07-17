import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../hooks/useNotifications";

// SVG icons keyed by notification type — no emojis
const TypeIcon = ({ type }) => {
  switch (type) {
    case "connection_request":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
        </svg>
      );
    case "connection_accepted":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
          <polyline points="16 11 18 13 22 9" />
        </svg>
      );
    case "project_application":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "project_application_accepted":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      );
    case "project_application_rejected":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      );
    case "new_message":
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      );
  }
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function NotificationBell() {
  const { notifications, unreadCount, loading, markOne, markAll } = useNotifications();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [, forceUpdate] = useState(0);
  const containerRef = useRef(null);
  const bellRef = useRef(null);

  const getRoute = (n) => {
    switch (n.type) {
      case "connection_request": return "/requests";
      case "connection_accepted": return "/connections";
      case "project_application": return n.referenceId ? `/projects/${n.referenceId}/applications` : "/projects/mine";
      case "project_application_accepted":
      case "project_application_rejected": return "/projects/mine";
      case "new_message": return n.actor?._id ? `/chat?user=${n.actor._id}` : "/chat";
      default: return null;
    }
  };

  useEffect(() => {
    if (!open) return;
    const id = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (e.key === "Escape") { setOpen(false); bellRef.current?.focus(); }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open]);

  return (
    <div className="notif-bell-wrapper" ref={containerRef}>
      <button
        ref={bellRef}
        className="notif-bell-btn"
        onClick={() => setOpen((v) => !v)}
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="notif-badge" aria-hidden="true">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications" aria-modal="false">
          <div className="notif-dropdown-header">
            <span className="notif-dropdown-title">Notifications</span>
            {unreadCount > 0 && (
              <button className="notif-mark-all" onClick={async () => { await markAll(); setOpen(false); }}>
                Mark all read
              </button>
            )}
          </div>

          <ul className="notif-list" role="list">
            {loading && (
              <li className="notif-state" role="status">
                <div className="spinner" />
              </li>
            )}

            {!loading && notifications.length === 0 && (
              <li className="notif-state">
                <p className="notif-empty-title">No notifications yet</p>
                <p className="notif-empty-hint">Activity from connections and projects will appear here.</p>
              </li>
            )}

            {!loading && notifications.map((n) => (
              <li key={n._id} role="listitem">
                <button
                  className={`notif-item${n.isRead ? "" : " notif-item--unread"}`}
                  onClick={() => {
                    if (!n.isRead) markOne(n._id);
                    const route = getRoute(n);
                    if (route) { setOpen(false); navigate(route); }
                  }}
                >
                  <span className="notif-item-icon" aria-hidden="true">
                    <TypeIcon type={n.type} />
                  </span>
                  <div className="notif-item-body">
                    <p className="notif-item-msg">{n.message}</p>
                    <time className="notif-item-time" dateTime={n.createdAt}>
                      {timeAgo(n.createdAt)}
                    </time>
                  </div>
                  {!n.isRead && <span className="notif-unread-dot" aria-label="Unread" />}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
