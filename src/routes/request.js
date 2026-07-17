const express = require("express");
const requestRouter = express.Router();
const { authMiddle } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const user = require("../models/user");
const sendEmail = require("../utils/ses_sendemail");
const { createNotification } = require("../utils/notifications");

requestRouter.post("/request/send/:status/:toUserId", authMiddle, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const { toUserId, status } = req.params;

    if (fromUserId.equals(toUserId))
      return res.status(400).json({ message: "Cannot send request to yourself" });

    const allowedStatus = ["ignored", "interested"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Invalid status type " + status });

    const isReceiverExists = await user.findById(toUserId);
    if (!isReceiverExists)
      return res.status(404).json({ message: "User not found" });

    const existingConnectionRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId },
        { fromUserId: toUserId, toUserId: fromUserId },
      ],
    });
    if (existingConnectionRequest)
      return res.status(409).json({ message: "Connection request already exists" });

    const connectionRequest = new ConnectionRequest({ fromUserId, toUserId, status });
    const mssg =
      status === "interested"
        ? `${req.user.firstName} is interested in ${isReceiverExists.firstName}`
        : `${req.user.firstName} ignored ${isReceiverExists.firstName}`;

    const data = await connectionRequest.save();

    if (status === "interested") {
      createNotification({
        recipient: toUserId,
        actor: req.user._id,
        type: "connection_request",
        message: `${req.user.firstName} wants to connect with you.`,
        referenceId: data._id,
        referenceModel: "ConnectionRequest",
      });
    }

    try {
      await sendEmail.run("Received message from codetinder", mssg);
    } catch (emailError) {
      console.error("Connection request email could not be sent:", emailError.message);
    }

    res.json({ message: mssg, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

requestRouter.post("/request/review/:status/:requestId", authMiddle, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;
    const allowedStatus = ["accepted", "rejected"];
    if (!allowedStatus.includes(status))
      return res.status(400).json({ message: "Status not allowed" });

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });
    if (!connectionRequest)
      return res.status(404).json({ message: "Connection request not found" });

    connectionRequest.status = status;
    const data = await connectionRequest.save();

    if (status === "accepted") {
      createNotification({
        recipient: connectionRequest.fromUserId,
        actor: loggedInUser._id,
        type: "connection_accepted",
        message: `${loggedInUser.firstName} accepted your connection request.`,
        referenceId: connectionRequest._id,
        referenceModel: "ConnectionRequest",
      });
    }

    res.json({ message: `Connection request ${status} successfully`, data });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = requestRouter;
