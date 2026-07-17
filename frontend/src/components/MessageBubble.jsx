function formatTime(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const now = new Date();
  const isToday = d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  if (isToday) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" }) + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function ReadReceipt({ readAt }) {
  return (
    <span className={`msg-receipt${readAt ? " msg-receipt--read" : ""}`} aria-label={readAt ? "Read" : "Sent"}>
      <svg width="14" height="10" viewBox="0 0 16 10" fill="none" aria-hidden="true">
        {/* First check */}
        <polyline points="1,5 5,9 11,1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        {/* Second check — only shown when read */}
        {readAt && <polyline points="5,5 9,9 15,1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />}
      </svg>
    </span>
  );
}

export default function MessageBubble({ message, isMine }) {
  return (
    <div className={`msg-bubble-row${isMine ? " msg-bubble-row--mine" : ""}`}>
      <div className={`msg-bubble${isMine ? " msg-bubble--mine" : " msg-bubble--theirs"}`}>
        <p className="msg-text">{String(message.text || "")}</p>
        <div className="msg-meta">
          <time className="msg-time" dateTime={message.createdAt}>{formatTime(message.createdAt)}</time>
          {isMine && <ReadReceipt readAt={message.readAt} />}
        </div>
      </div>
    </div>
  );
}
