import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { getConnections } from "../services/userApi";
import { getMessages } from "../services/chatApi";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../hooks/useSocket";
import ConversationList from "../components/ConversationList";
import ChatWindow from "../components/ChatWindow";

export default function Chat() {
  const { user } = useAuth();
  const socket = useSocket();
  const [searchParams, setSearchParams] = useSearchParams();

  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [connectionsLoading, setConnectionsLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [sendError, setSendError] = useState("");
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set()); // userIds typing in current convo
  const [mobileView, setMobileView] = useState("list");

  const conversationIdRef = useRef(null);
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const selectedId = searchParams.get("user");
  const selected = connections.find((c) => c._id === selectedId);

  // ── Load connections ───────────────────────────────────────────────────────
  useEffect(() => {
    getConnections()
      .then((data) => setConnections(Array.isArray(data.data) ? data.data : []))
      .catch(() => setLoadError("Unable to load connections"))
      .finally(() => setConnectionsLoading(false));
  }, []);

  // ── Online presence listeners ──────────────────────────────────────────────
  useEffect(() => {
    const onOnline = ({ userId }) => setOnlineUsers((prev) => new Set([...prev, userId]));
    const onOffline = ({ userId }) => setOnlineUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    socket.on("user_online", onOnline);
    socket.on("user_offline", onOffline);
    return () => { socket.off("user_online", onOnline); socket.off("user_offline", onOffline); };
  }, [socket]);

  // ── Load history + join room ───────────────────────────────────────────────
  useEffect(() => {
    if (!selectedId) { setMessages([]); conversationIdRef.current = null; return; }
    let cancelled = false;
    setMessagesLoading(true);
    setLoadError("");
    setSendError("");
    setTypingUsers(new Set());

    getMessages(selectedId)
      .then((data) => {
        if (cancelled) return;
        setMessages(Array.isArray(data.data) ? data.data : []);
        conversationIdRef.current = data.conversationId ? String(data.conversationId) : null;
        socket.emit("join_conversation", { userId: selectedId }, (ack) => {
          if (cancelled) return;
          if (ack && !ack.ok) setLoadError(ack.error || "Could not join conversation");
          // Mark messages as read via socket after joining
          if (ack?.ok && conversationIdRef.current) {
            socket.emit("mark_read", { conversationId: conversationIdRef.current });
          }
        });
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message || "Unable to load messages"); })
      .finally(() => { if (!cancelled) setMessagesLoading(false); });

    return () => { cancelled = true; };
  }, [selectedId, socket]);

  // ── Incoming messages ──────────────────────────────────────────────────────
  useEffect(() => {
    const handler = (msg) => {
      const currentConvoId = conversationIdRef.current;
      if (!currentConvoId || String(msg.conversation) !== currentConvoId) return;
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
      // Auto-mark read if window is focused
      if (document.visibilityState === "visible") {
        socket.emit("mark_read", { conversationId: currentConvoId });
      }
    };
    socket.on("new_message", handler);
    return () => socket.off("new_message", handler);
  }, [socket]);

  // ── Read receipts ──────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = ({ conversationId, readAt }) => {
      if (String(conversationId) !== String(conversationIdRef.current)) return;
      setMessages((prev) =>
        prev.map((m) =>
          String(m.sender?._id ?? m.sender) === String(user?._id) && !m.readAt
            ? { ...m, readAt }
            : m
        )
      );
    };
    socket.on("messages_read", handler);
    return () => socket.off("messages_read", handler);
  }, [socket, user]);

  // ── Typing indicators ──────────────────────────────────────────────────────
  useEffect(() => {
    const onStart = ({ userId, conversationId }) => {
      if (String(conversationId) !== String(conversationIdRef.current)) return;
      setTypingUsers((prev) => new Set([...prev, userId]));
    };
    const onStop = ({ userId, conversationId }) => {
      if (String(conversationId) !== String(conversationIdRef.current)) return;
      setTypingUsers((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    };
    socket.on("typing_start", onStart);
    socket.on("typing_stop", onStop);
    return () => { socket.off("typing_start", onStart); socket.off("typing_stop", onStop); };
  }, [socket]);

  const handleSelect = (userId) => {
    setSearchParams({ user: userId });
    setSendError("");
    setMobileView("chat");
  };

  const handleBack = () => setMobileView("list");

  // ── Text change with typing emit ───────────────────────────────────────────
  const handleTextChange = (value) => {
    setText(value);
    const convoId = conversationIdRef.current;
    if (!convoId) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit("typing_start", { conversationId: convoId });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit("typing_stop", { conversationId: convoId });
    }, 1500);
  };

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || !conversationIdRef.current) return;
    // Stop typing indicator immediately on send
    clearTimeout(typingTimerRef.current);
    if (isTypingRef.current) {
      isTypingRef.current = false;
      socket.emit("typing_stop", { conversationId: conversationIdRef.current });
    }
    setSendError("");
    socket.emit("send_message", { conversationId: conversationIdRef.current, text: trimmed }, (ack) => {
      if (ack && !ack.ok) setSendError(ack.error || "Failed to send message");
    });
    setText("");
  };

  return (
    <div className="chat-page">
      <div className={`chat-layout-v2${selectedId && mobileView === "chat" ? " chat-layout-v2--chat-open" : ""}`}>
        <div className={`chat-list-panel${selectedId && mobileView === "chat" ? " chat-panel-hidden" : ""}`}>
          <ConversationList
            connections={connections}
            selectedId={selectedId}
            loading={connectionsLoading}
            onlineUsers={onlineUsers}
            onSelect={handleSelect}
          />
        </div>
        <div className={`chat-main-panel${!selectedId || mobileView === "list" ? " chat-panel-hidden" : ""}`}>
          {selected ? (
            <ChatWindow
              contact={selected}
              messages={messages}
              loading={messagesLoading}
              loadError={loadError}
              sendError={sendError}
              text={text}
              onTextChange={handleTextChange}
              onSend={handleSend}
              onBack={handleBack}
              currentUserId={user?._id}
              isOnline={onlineUsers.has(selected._id)}
              typingUsers={typingUsers}
            />
          ) : (
            <div className="chat-no-selection">
              <p>Select a conversation to start chatting.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
