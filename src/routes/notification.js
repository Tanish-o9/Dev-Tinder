const express = require("express");
const mongoose = require("mongoose");
const { authMiddle } = require("../middlewares/auth");
const Notification = require("../models/notification");

const notificationRouter = express.Router();

// GET /notifications — fetch latest 50 notifications for the logged-in user
notificationRouter.get("/notifications", authMiddle, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .populate("actor", "firstName lastName photoURL");
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ data: notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /notifications/read-all — mark all as read
notificationRouter.patch("/notifications/read-all", authMiddle, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );
    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH /notifications/:id/read — mark a single notification as read
notificationRouter.patch("/notifications/:id/read", authMiddle, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid notification id" });

    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );
    if (!notification)
      return res.status(404).json({ message: "Notification not found" });

    res.json({ data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = notificationRouter;
