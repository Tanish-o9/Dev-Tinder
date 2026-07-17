const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("./models/user");
const ConnectionRequest = require("./models/connectionRequest");
const Conversation = require("./models/conversation");
const Message = require("./models/message");
const { verifyConnection, getOrCreateConversation } = require("./utils/chat");
const { createNotification, setIo } = require("./utils/notifications");

function attachSocket(server, allowedOrigins) {
  const io = new Server(server, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  // Give the notifications utility access to io so it can push real-time events.
  setIo(io);

  // ── Auth middleware ────────────────────────────────────────────────────────
  io.use(async (socket, next) => {
    try {
      const raw = socket.handshake.headers.cookie || "";
      const match = raw.match(/(?:^|;\s*)token=([^;]+)/);
      if (!match) return next(new Error("Authentication required"));
      const { _id } = jwt.verify(match[1], process.env.JWT_SECRET);
      const user = await User.findById(_id).select("_id firstName lastName");
      if (!user) return next(new Error("User not found"));
      socket.user = user;
      next();
    } catch {
      next(new Error("Invalid or expired token"));
    }
  });

  // Track online users: userId → Set of socketIds
  const onlineUsers = new Map();

  // ── Connection handler ─────────────────────────────────────────────────────
  io.on("connection", (socket) => {
    const me = socket.user._id.toString();

    // Personal room — used for targeted notification delivery.
    socket.join(`user:${me}`);

    // ── Online presence ──────────────────────────────────────────────────────
    if (!onlineUsers.has(me)) onlineUsers.set(me, new Set());
    onlineUsers.get(me).add(socket.id);
    // Broadcast to everyone that this user is online
    socket.broadcast.emit("user_online", { userId: me });

    // ── join_conversation ────────────────────────────────────────────────────
    // Payload:  { userId: string }
    // Ack:      { ok: true, conversationId: string } | { ok: false, error: string }
    socket.on("join_conversation", async (payload, ack) => {
      const reply = (ok, data = {}) => typeof ack === "function" && ack({ ok, ...data });
      try {
        const userId = payload?.userId;
        if (!userId || !mongoose.Types.ObjectId.isValid(userId))
          return reply(false, { error: "Invalid userId" });

        await verifyConnection(me, userId);
        const convo = await getOrCreateConversation(me, userId);
        socket.join(`convo:${convo._id}`);
        reply(true, { conversationId: String(convo._id) });
      } catch (err) {
        reply(false, { error: err.message });
      }
    });

    // ── send_message ─────────────────────────────────────────────────────────
    // Payload:  { conversationId: string, text: string }
    // Ack:      { ok: true } | { ok: false, error: string }
    socket.on("send_message", async (payload, ack) => {
      const reply = (ok, data = {}) => typeof ack === "function" && ack({ ok, ...data });
      try {
        const { conversationId, text } = payload || {};

        const trimmed = typeof text === "string" ? text.trim() : "";
        if (!trimmed) return reply(false, { error: "Message cannot be empty" });
        if (trimmed.length > 2000) return reply(false, { error: "Message too long (max 2000 characters)" });

        if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId))
          return reply(false, { error: "Invalid conversation" });

        // Gate 1: socket must be in the room
        if (!socket.rooms.has(`convo:${conversationId}`))
          return reply(false, { error: "Not a participant of this conversation" });

        // Gate 2: DB membership check
        const convo = await Conversation.findOne({ _id: conversationId, participants: me });
        if (!convo) return reply(false, { error: "Conversation not found" });

        const message = await Message.create({
          conversation: convo._id,
          sender: me,
          text: trimmed,
        });

        await Conversation.findByIdAndUpdate(convo._id, {
          lastMessage: trimmed.length > 100 ? trimmed.slice(0, 100) + "…" : trimmed,
          lastMessageAt: message.createdAt,
        });

        const messagePayload = {
          _id: message._id,
          conversation: convo._id,
          sender: {
            _id: socket.user._id,
            firstName: socket.user.firstName,
            lastName: socket.user.lastName,
          },
          text: message.text,
          createdAt: message.createdAt,
          readAt: null,
        };

        // Broadcast to both participants in the conversation room.
        io.to(`convo:${convo._id}`).emit("new_message", messagePayload);

        // Notify the other participant if they are not in the conversation room
        // (i.e. they are connected but not currently viewing this chat).
        const recipientId = convo.participants.find((p) => p.toString() !== me);
        if (recipientId) {
          const recipientRoom = `convo:${convo._id}`;
          const recipientSockets = await io.in(`user:${recipientId}`).fetchSockets();
          const recipientInConvo = recipientSockets.some((s) => s.rooms.has(recipientRoom));

          if (!recipientInConvo) {
            createNotification({
              recipient: recipientId,
              actor: me,
              type: "new_message",
              message: `${socket.user.firstName} sent you a message.`,
              referenceId: message._id,
              referenceModel: "Message",
            });
          }
        }

        reply(true);
      } catch (err) {
        reply(false, { error: err.message });
      }
    });

    // ── Typing indicators ────────────────────────────────────────────────────
    // Payload: { conversationId: string }
    socket.on("typing_start", ({ conversationId } = {}) => {
      if (!conversationId || !socket.rooms.has(`convo:${conversationId}`)) return;
      socket.to(`convo:${conversationId}`).emit("typing_start", { userId: me, conversationId });
    });

    socket.on("typing_stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`convo:${conversationId}`).emit("typing_stop", { userId: me, conversationId });
    });

    // ── Mark messages read ───────────────────────────────────────────────────
    // Payload: { conversationId: string }
    socket.on("mark_read", async ({ conversationId } = {}) => {
      if (!conversationId || !mongoose.Types.ObjectId.isValid(conversationId)) return;
      try {
        const convo = await Conversation.findOne({ _id: conversationId, participants: me });
        if (!convo) return;
        const now = new Date();
        await Message.updateMany(
          { conversation: convo._id, sender: { $ne: me }, readAt: null },
          { $set: { readAt: now } }
        );
        // Notify the sender their messages were read
        const senderId = convo.participants.find((p) => p.toString() !== me);
        if (senderId) {
          io.to(`user:${senderId}`).emit("messages_read", { conversationId, readBy: me, readAt: now });
        }
      } catch { /* silent */ }
    });

    socket.on("disconnect", () => {
      const sockets = onlineUsers.get(me);
      if (sockets) {
        sockets.delete(socket.id);
        if (sockets.size === 0) {
          onlineUsers.delete(me);
          socket.broadcast.emit("user_offline", { userId: me });
        }
      }
    });
  });

  return io;
}

module.exports = { attachSocket };
