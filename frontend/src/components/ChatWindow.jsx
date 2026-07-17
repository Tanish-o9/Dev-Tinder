import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

export default function ChatWindow({
  contact, messages, loading, loadError, sendError,
  text, onTextChange, onSend, onBack, currentUserId,
  isOnline = false, typingUsers = new Set(),
}) {
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingUsers]);

  const isTyping = typingUsers.size > 0;

  return (
    <div className="chat-window">
      <header className="chat-window-header">
        {onBack && (
          <button className="chat-back-btn" onClick={onBack} aria-label="Back to conversations">←</button>
        )}
        <div className="chat-window-contact">
          <div className="chat-window-avatar">
            {contact.photoURL
              ? <img src={contact.photoURL} alt="" />
              : <span>{`${contact.firstName?.[0] ?? ""}${contact.lastName?.[0] ?? ""}`.toUpperCase()}</span>
            }
            {isOnline && <span className="online-dot online-dot--header" aria-hidden="true" />}
          </div>
          <div>
            <p className="chat-window-name">{contact.firstName} {contact.lastName}</p>
            <p className="chat-window-role">
              {isTyping
                ? <span className="typing-status">typing…</span>
                : isOnline
                  ? <span className="online-status">Online</span>
                  : contact.developerRole
              }
            </p>
          </div>
        </div>
      </header>

      {loadError && <div className="chat-window-error" role="alert">{loadError}</div>}

      <div className="chat-window-messages" aria-live="polite">
        {loading && <div className="chat-window-state"><div className="spinner" /></div>}

        {!loading && messages.length === 0 && !loadError && (
          <div className="chat-window-state">
            <p className="chat-window-empty-title">No messages yet</p>
            <p className="chat-window-empty-hint">Say hello to {contact.firstName}!</p>
          </div>
        )}

        {messages.map((msg) => {
          const senderId = msg.sender?._id ?? msg.sender;
          return (
            <MessageBubble
              key={msg._id}
              message={msg}
              isMine={String(senderId) === String(currentUserId)}
            />
          );
        })}

        {isTyping && (
          <div className="typing-indicator" aria-live="polite" aria-label={`${contact.firstName} is typing`}>
            <span /><span /><span />
          </div>
        )}

        <div ref={endRef} aria-hidden="true" />
      </div>

      <form className="chat-compose-form" onSubmit={onSend}>
        {sendError && <p className="chat-compose-error" role="alert">{sendError}</p>}
        <div className="chat-compose-row">
          <input
            className="chat-compose-input"
            value={text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={2000}
            placeholder="Write a message…"
            autoComplete="off"
          />
          <button className="btn btn-primary chat-compose-btn" type="submit" disabled={!text.trim()}>
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
