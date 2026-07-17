export default function ConversationList({ connections, selectedId, loading, onlineUsers = new Set(), onSelect }) {
  if (loading) {
    return (
      <div className="conv-list">
        <div className="conv-list-header">Messages</div>
        <div className="conv-list-empty"><div className="spinner" /></div>
      </div>
    );
  }

  return (
    <div className="conv-list">
      <div className="conv-list-header">Messages</div>
      {connections.length === 0 ? (
        <div className="conv-list-empty">
          <p>No accepted connections yet.</p>
          <p className="conv-list-hint">Accept a connection request to start chatting.</p>
        </div>
      ) : (
        <ul className="conv-list-items" role="listbox" aria-label="Conversations">
          {connections.map((c) => {
            const initials = `${c.firstName?.[0] ?? ""}${c.lastName?.[0] ?? ""}`.toUpperCase();
            const isActive = c._id === selectedId;
            const isOnline = onlineUsers.has(c._id);
            return (
              <li key={c._id} role="option" aria-selected={isActive}>
                <button
                  className={`conv-item${isActive ? " conv-item--active" : ""}`}
                  onClick={() => onSelect(c._id)}
                >
                  <div className="conv-item-avatar">
                    {c.photoURL ? <img src={c.photoURL} alt="" /> : <span>{initials}</span>}
                    {isOnline && <span className="online-dot" aria-label="Online" />}
                  </div>
                  <div className="conv-item-body">
                    <span className="conv-item-name">{c.firstName} {c.lastName}</span>
                    {c.developerRole && <span className="conv-item-role">{c.developerRole}</span>}
                  </div>
                  {isOnline && <span className="conv-online-label">Online</span>}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
