const express = require("express");
const mongoose = require("mongoose");
const { authMiddle } = require("../middlewares/auth");
const { verifyConnection, getOrCreateConversation } = require("../utils/chat");
const Conversation = require("../models/conversation");
const Message = require("../models/message");

const chatRouter = express.Router();

chatRouter.get("/conversations", authMiddle, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user._id })
      .sort({ lastMessageAt: -1, updatedAt: -1 })
      .populate("participants", "firstName lastName photoURL");
    res.json({ data: conversations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

chatRouter.get("/:userId/messages", authMiddle, async (req, res) => {
  try {
    const me = req.user._id;
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    try {
      await verifyConnection(me, userId);
    } catch {
      return res.status(403).json({ message: "You can only chat with accepted connections" });
    }
    const convo = await getOrCreateConversation(me, userId);
    const messages = await Message.find({ conversation: convo._id })
      .sort({ createdAt: 1 })
      .limit(200)
      .populate("sender", "firstName lastName");
    // Mark messages from the other user as read on fetch
    await Message.updateMany(
      { conversation: convo._id, sender: { $ne: me }, readAt: null },
      { $set: { readAt: new Date() } }
    );
    res.json({ data: messages, conversationId: convo._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = chatRouter;
