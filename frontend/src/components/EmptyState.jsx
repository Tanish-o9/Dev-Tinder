export default function EmptyState({ title, message, action, actionLabel, onAction }) {
  // Support both {action: {label, onClick}} and legacy {actionLabel, onAction}
  const btn = action ?? (actionLabel && onAction ? { label: actionLabel, onClick: onAction } : null);

  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="4 17 10 11 4 5" />
          <line x1="12" y1="19" x2="20" y2="19" />
        </svg>
      </div>
      <h3>{title || "Nothing here yet"}</h3>
      {message && <p>{message}</p>}
      {btn && (
        <button className="btn btn-primary" onClick={btn.onClick}>
          {btn.label}
        </button>
      )}
    </div>
  );
}
