const Notification = require("../models/notification");

// io is set once by socket.js after the Server is created.
// Using a holder object avoids circular-require issues.
const _io = { instance: null };

const setIo = (io) => { _io.instance = io; };

/**
 * Create a notification and push it to the recipient in real time.
 *
 * All notifications are created by trusted backend actions only.
 * The frontend has no endpoint to create notifications directly.
 *
 * @param {object} opts
 * @param {ObjectId|string} opts.recipient   - User who receives the notification
 * @param {ObjectId|string} [opts.actor]     - User whose action triggered it
 * @param {string}          opts.type        - One of NOTIFICATION_TYPES
 * @param {string}          opts.message     - Human-readable text (max 300 chars)
 * @param {ObjectId|string} [opts.referenceId]    - Related document ID
 * @param {string}          [opts.referenceModel] - Mongoose model name for referenceId
 */
const createNotification = async ({
  recipient,
  actor = null,
  type,
  message,
  referenceId = null,
  referenceModel = null,
}) => {
  try {
    const notification = await Notification.create({
      recipient,
      actor,
      type,
      message,
      referenceId,
      referenceModel,
    });

    // Push to the recipient's personal socket room if they are connected.
    if (_io.instance) {
      _io.instance.to(`user:${recipient}`).emit("new_notification", {
        _id: notification._id,
        type: notification.type,
        message: notification.message,
        isRead: notification.isRead,
        actor,
        referenceId,
        referenceModel,
        createdAt: notification.createdAt,
      });
    }

    return notification;
  } catch (error) {
    // Notification failure must never break the calling action.
    console.error("Notification could not be created:", error.message);
  }
};

module.exports = { createNotification, setIo };
