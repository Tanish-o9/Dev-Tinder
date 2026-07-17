const mongoose = require("mongoose");

const NOTIFICATION_TYPES = [
  "connection_request",
  "connection_accepted",
  "project_application",
  "project_application_accepted",
  "project_application_rejected",
  "new_message",
];

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    actor: {
      // The user whose action triggered this notification.
      // Null for system-generated notifications.
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    type: {
      type: String,
      required: true,
      enum: NOTIFICATION_TYPES,
    },
    referenceId: {
      // The ID of the related document (connection request, project, message…)
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    referenceModel: {
      // The Mongoose model name for referenceId — enables dynamic populate.
      type: String,
      enum: ["ConnectionRequest", "Project", "ProjectApplication", "Message", null],
      default: null,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true }
);

// Compound index: fetch unread notifications for a user efficiently
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model("Notification", notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
