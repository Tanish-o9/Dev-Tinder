const mongoose = require("mongoose");
const ConnectionRequest = require("../models/connectionRequest");
const Conversation = require("../models/conversation");

/**
 * Throws if userA and userB do not have an accepted connection.
 * Also validates that otherId is a valid ObjectId.
 */
const verifyConnection = async (userId, otherId) => {
  if (!mongoose.Types.ObjectId.isValid(otherId)) throw new Error("Invalid user");
  const exists = await ConnectionRequest.exists({
    status: "accepted",
    $or: [
      { fromUserId: userId, toUserId: otherId },
      { fromUserId: otherId, toUserId: userId },
    ],
  });
  if (!exists) throw new Error("You can only chat with accepted connections");
};

/**
 * Returns the existing conversation between userA and userB,
 * or creates one if it does not exist yet.
 * Participants are stored in sorted order so the query is deterministic.
 */
const getOrCreateConversation = async (userA, userB) => {
  const sorted = [userA, userB].map(String).sort();
  let convo = await Conversation.findOne({ participants: { $all: sorted, $size: 2 } });
  if (!convo) convo = await Conversation.create({ participants: sorted });
  return convo;
};

module.exports = { verifyConnection, getOrCreateConversation };
