const express = require("express");
const mongoose = require("mongoose");
const { authMiddle } = require("../middlewares/auth");
const userRouter = express.Router();
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const Report = require("../models/report");
const { getMatchScore } = require("../utils/matchScore");
const { developerRoles, experienceLevels, interestOptions, availabilityOptions } = require("../utils/validation");
const { getPublicGithubProfile } = require("../services/githubService");

const publicFields = "firstName lastName age gender photoURL about educationType institutionName socialLinks developerRole experienceLevel collaborationInterests githubUsername location availability skills";
const getMatch = (viewer, candidate) => getMatchScore(viewer, candidate);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFeedFilters = (query) => {
  const filters = {};
  const allowedQueryKeys = ["page", "limit", "skill", "role", "experience", "interest", "availability", "location"];
  if (Object.keys(query).some((key) => !allowedQueryKeys.includes(key))) throw new Error("Unsupported feed filter");
  const text = (key, max = 100) => {
    if (query[key] === undefined) return "";
    if (typeof query[key] !== "string" || !query[key].trim() || query[key].trim().length > max) throw new Error(`Invalid ${key} filter`);
    return query[key].trim();
  };
  const skill = text("skill", 50); const location = text("location");
  const role = text("role"); const experience = text("experience"); const interest = text("interest"); const availability = text("availability");
  if (role && !developerRoles.includes(role)) throw new Error("Invalid role filter");
  if (experience && !experienceLevels.includes(experience)) throw new Error("Invalid experience filter");
  if (interest && !interestOptions.includes(interest)) throw new Error("Invalid interest filter");
  if (availability && !availabilityOptions.includes(availability)) throw new Error("Invalid availability filter");
  if (skill) filters.skills = new RegExp(`^${escapeRegex(skill)}$`, "i");
  if (location) filters.location = new RegExp(escapeRegex(location), "i");
  if (role) filters.developerRole = role;
  if (experience) filters.experienceLevel = experience;
  if (interest) filters.collaborationInterests = interest;
  if (availability) filters.availability = availability;
  return filters;
};

const positiveInteger = (value, name, defaultValue) => {
  if (value === undefined) return defaultValue;
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    throw new Error(`Invalid ${name}`);
  }
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new Error(`Invalid ${name}`);
  }
  return parsed;
};

// GET /developers/:userId/compatibility — full match breakdown (feed cards use this on demand)
userRouter.get("/developers/:userId/compatibility", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId))
      return res.status(400).json({ message: "Invalid user ID" });
    if (req.user._id.equals(userId))
      return res.status(400).json({ message: "Cannot compare with yourself" });
    const candidate = await User.findById(userId).select(publicFields).lean();
    if (!candidate) return res.status(404).json({ message: "Developer not found" });
    const { getDeveloperCompatibility } = require("../utils/developerSimilarity");
    const result = getDeveloperCompatibility(req.user, candidate);
    res.json({ data: result });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// View the public profile of an accepted connection.
userRouter.get("/user/profile/:userId", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    const loggedInUserId = req.user._id;
    const isConnection = await ConnectionRequest.exists({
      status: "accepted",
      $or: [
        { fromUserId: loggedInUserId, toUserId: userId },
        { fromUserId: userId, toUserId: loggedInUserId },
      ],
    });
    if (!isConnection) return res.status(403).json({ message: "Profile is available only to your connections" });
    const profile = await User.findById(userId).select(publicFields);
    if (!profile) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ data: profile });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

//Get all the pending connection request for the loggedInUser
userRouter.get("/user/requests/received", authMiddle, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser,
      status: "interested",
    })
      // .populate("fromUserId", ["firstName", "lastName"]);
      // OR
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "gender",
        "photoURL",
        "age",
        "educationType",
        "institutionName",
        "socialLinks",
        "developerRole",
        "experienceLevel",
        "collaborationInterests",
        "githubUsername",
        "location",
        "availability",
      ]);

    if (!connectionRequests.length) {
      return res.status(200).json({
        message: "No pending connection requests found",
        data: [],
      });
    }
    res
      .status(200)
      .json({ message: "Data fetched successfully", data: connectionRequests });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

userRouter.get("/user/connections", authMiddle, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const connections = await ConnectionRequest.find({
      status: "accepted",
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    })
      .populate("fromUserId", [
        "firstName",
        "lastName",
        "about",
        "gender",
        "photoURL",
        "age",
        "educationType",
        "institutionName",
        "socialLinks",
        "developerRole",
        "experienceLevel",
        "collaborationInterests",
        "githubUsername",
        "location",
        "availability",
      ])
      .populate("toUserId", [
        "firstName",
        "lastName",
        "about",
        "gender",
        "photoURL",
        "age",
        "educationType",
        "institutionName",
        "socialLinks",
        "developerRole",
        "experienceLevel",
        "collaborationInterests",
        "githubUsername",
        "location",
        "availability",
      ]);
    if (!connections.length) {
      return res.status(200).json({
        message: "No connections yet 😥",
        data: [],
      });
    }
    const filteredConnectionsFields = connections.map((row) =>
      row.fromUserId._id.equals(loggedInUser._id)
        ? row.toUserId
        : row.fromUserId
    );
    res.status(200).json({
      message: "Connections found successfully",
      data: filteredConnectionsFields,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

userRouter.get("/feed", authMiddle, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const page = positiveInteger(req.query.page, "page", 1);
    let limit = positiveInteger(req.query.limit, "limit", 10);
    limit = limit > 60 ? 60 : limit;
    const skip = (page - 1) * limit;
    const filters = buildFeedFilters(req.query);

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId toUserId age gender photoURL about");

    const blockedUsers = new Set((loggedInUser.blockedUsers || []).map((id) => id.toString()));
    connectionRequests.forEach((user) => {
      blockedUsers.add(user.fromUserId.toString());
      blockedUsers.add(user.toUserId.toString());
    });
    // Hard DB-level cap prevents loading the entire collection into memory.
    const DB_FETCH_CAP = 500;
    const reqUsers = await User.find({
      ...filters,
      _id: { $nin: Array.from(blockedUsers), $ne: loggedInUser._id },
      blockedUsers: { $ne: loggedInUser._id },
    }).select(publicFields).limit(DB_FETCH_CAP).lean();

    const matchedUsers = reqUsers
      .map((candidate) => ({ ...candidate, match: getMatch(loggedInUser, candidate) }))
      .sort((a, b) => b.match.score - a.match.score || (a.firstName || "").localeCompare(b.firstName || ""));

    const page_data = matchedUsers.slice(skip, skip + limit).map(({ match, ...candidate }) => ({
      ...candidate,
      matchScore: match.score,
      matchReasons: match.reasons,
      commonSkills: match.commonSkills,
      matchDimensions: match.dimensions,
      complementarySkills: match.complementarySkills,
      relatedSkills: match.relatedSkills,
    }));

    res.status(200).json({
      data: page_data,
      total: matchedUsers.length,
      pagination: {
        page,
        limit,
        total: matchedUsers.length,
        totalPages: Math.ceil(matchedUsers.length / limit),
        hasNextPage: skip + limit < matchedUsers.length,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Static routes must come before /:userId dynamic routes
userRouter.get("/developers/saved", authMiddle, async (req, res) => {
  const viewer = await User.findById(req.user._id).populate("savedDevelopers", publicFields);
  res.json({ data: viewer.savedDevelopers.map((candidate) => { const match = getMatch(req.user, candidate); return { ...candidate.toObject(), matchScore: match.score, matchReasons: match.reasons, commonSkills: match.commonSkills }; }) });
});

userRouter.post("/developers/:userId/save", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId) || req.user._id.equals(userId)) return res.status(400).json({ message: "Invalid developer" });
    if (!await User.exists({ _id: userId })) return res.status(404).json({ message: "Developer not found" });
    await User.updateOne({ _id: req.user._id }, { $addToSet: { savedDevelopers: userId } });
    res.json({ message: "Developer saved" });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

userRouter.delete("/developers/:userId/save", authMiddle, async (req, res) => {
  await User.updateOne({ _id: req.user._id }, { $pull: { savedDevelopers: req.params.userId } });
  res.json({ message: "Developer removed from saved list" });
});

userRouter.get("/developers/blocked", authMiddle, async (req, res) => {
  try {
    const viewer = await User.findById(req.user._id).populate("blockedUsers", publicFields);
    res.json({ data: viewer.blockedUsers });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

// Block a user:
// - Adds to blockedUsers (idempotent via $addToSet)
// - Removes from savedDevelopers
// - Removes any active/pending connection request between the two users
//   (does NOT delete messages or conversations — those are historical records)
userRouter.post("/developers/:userId/block", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });
    if (req.user._id.equals(userId)) return res.status(400).json({ message: "You cannot block yourself" });
    if (!await User.exists({ _id: userId })) return res.status(404).json({ message: "User not found" });

    const myId = req.user._id;
    await Promise.all([
      User.updateOne({ _id: myId }, { $addToSet: { blockedUsers: userId }, $pull: { savedDevelopers: userId } }),
      // Remove connection request in either direction (any status)
      ConnectionRequest.deleteOne({
        $or: [{ fromUserId: myId, toUserId: userId }, { fromUserId: userId, toUserId: myId }],
      }),
    ]);
    res.json({ message: "User blocked" });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

userRouter.delete("/developers/:userId/block", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });
    await User.updateOne({ _id: req.user._id }, { $pull: { blockedUsers: userId } });
    res.json({ message: "User unblocked" });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

userRouter.post("/developers/:userId/report", authMiddle, async (req, res) => {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).json({ message: "Invalid user ID" });
    if (req.user._id.equals(userId)) return res.status(400).json({ message: "You cannot report yourself" });
    const { reason, description } = req.body;
    if (!Report.schema.path("reason").enumValues.includes(reason))
      return res.status(400).json({ message: "Invalid reason", validReasons: Report.schema.path("reason").enumValues });
    if (!await User.exists({ _id: userId })) return res.status(404).json({ message: "User not found" });
    await Report.create({ reporter: req.user._id, reportedUser: userId, reason, description: description?.trim() || "" });
    res.status(201).json({ message: "Report submitted. Thank you for helping keep the community safe." });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: "You have already reported this user" });
    res.status(400).json({ message: error.message });
  }
});

// GET /developers/search — full-text developer search
// Supports: q (name/role/skill/location), page, limit
userRouter.get("/developers/search", authMiddle, async (req, res) => {
  try {
    const raw = req.query.q;
    if (!raw || typeof raw !== "string" || !raw.trim())
      return res.status(400).json({ message: "Search query is required" });
    const q = raw.trim().slice(0, 100);
    const page = positiveInteger(req.query.page, "page", 1);
    let limit = positiveInteger(req.query.limit, "limit", 20);
    limit = Math.min(limit, 40);
    const skip = (page - 1) * limit;

    const escaped = escapeRegex(q);
    const pattern = new RegExp(escaped, "i");

    // Blocked users must be excluded both ways
    const blockedByMe = (req.user.blockedUsers || []).map((id) => id.toString());
    const blockedMeUsers = await User.find({ blockedUsers: req.user._id }).select("_id").lean();
    const excluded = new Set([...blockedByMe, ...blockedMeUsers.map((u) => u._id.toString()), req.user._id.toString()]);

    const candidates = await User.find({
      _id: { $nin: Array.from(excluded) },
      $or: [
        { firstName: pattern },
        { lastName: pattern },
        { developerRole: pattern },
        { skills: pattern },
        { location: pattern },
        { collaborationInterests: pattern },
      ],
    }).select(publicFields).limit(200).lean();

    const results = candidates
      .map((c) => ({ ...c, match: getMatch(req.user, c) }))
      .sort((a, b) => b.match.score - a.match.score)
      .slice(skip, skip + limit)
      .map(({ match, ...c }) => ({
        ...c,
        matchScore: match.score,
        matchReasons: match.reasons,
        commonSkills: match.commonSkills,
        matchDimensions: match.dimensions,
        complementarySkills: match.complementarySkills,
      }));

    res.json({
      data: results,
      pagination: {
        page, limit,
        total: candidates.length,
        totalPages: Math.ceil(candidates.length / limit),
        hasNextPage: skip + limit < candidates.length,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

userRouter.get("/github/:username", authMiddle, async (req, res) => {
  try {
    res.json({ data: await getPublicGithubProfile(req.params.username) });
  } catch (error) { res.status(error.status || 502).json({ message: error.message || "GitHub data could not be loaded" }); }
});

module.exports = userRouter;
