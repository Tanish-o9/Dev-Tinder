const express = require("express");
const profileRouter = express.Router();
const { authMiddle } = require("../middlewares/auth");
const { validateEditProfileData, validateEditPassword, normalizeProfileData } = require("../utils/validation");
const user = require("../models/user");
const bcrypt = require("bcrypt");
const { getProfileCompletion, getProfileSuggestions } = require("../utils/profileCompletion");
const { TAXONOMY } = require("../data/skillTaxonomy");

// Collaboration readiness: how complete is the profile for matching purposes
const getCollaborationReadiness = (profile) => {
  const fields = [
    { key: "skills", weight: 25, hint: "Add your skills" },
    { key: "developerRole", weight: 20, hint: "Add your developer role", check: (v) => v && v !== "Other" },
    { key: "availability", weight: 15, hint: "Set your availability" },
    { key: "collaborationInterests", weight: 15, hint: "Add collaboration interests" },
    { key: "about", weight: 15, hint: "Add a developer bio" },
    { key: "githubUsername", weight: 10, hint: "Add your GitHub username" },
  ];
  let score = 0;
  const missing = [];
  for (const f of fields) {
    const val = profile?.[f.key];
    const filled = f.check ? f.check(val) : (Array.isArray(val) ? val.length > 0 : Boolean(typeof val === "string" ? val.trim() : val));
    if (filled) score += f.weight;
    else missing.push(f.hint);
  }
  let label = "Needs more information";
  if (score >= 85) label = "Strong profile for project matching";
  else if (score >= 60) label = "Good profile — a few improvements will help";
  else if (score >= 40) label = "Profile is taking shape";
  return { score, label, missing: missing.slice(0, 3) };
};

profileRouter.get("/view", authMiddle, async (req, res) => {
  try {
    const profile = req.user.toJSON();
    const readiness = getCollaborationReadiness(profile);
    res.json({ ...profile, profileCompletion: getProfileCompletion(profile).score, profileSuggestions: getProfileSuggestions(profile), collaborationReadiness: readiness });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

profileRouter.patch("/edit", authMiddle, async (req, res) => {
  try {
    normalizeProfileData(req.body);
    validateEditProfileData(req);
    const loggedInUser = await user.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    );
    const profile = loggedInUser.toJSON();
    const readiness = getCollaborationReadiness(profile);
    res.json({
      message: `${loggedInUser.firstName}, your profile has been updated successfully`,
      data: { ...profile, profileCompletion: getProfileCompletion(loggedInUser).score, profileSuggestions: getProfileSuggestions(loggedInUser), collaborationReadiness: readiness },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET /profile/readiness — standalone readiness check
profileRouter.get("/readiness", authMiddle, (req, res) => {
  const profile = req.user.toJSON();
  res.json({ data: getCollaborationReadiness(profile) });
});

// GET /skills — returns the canonical skill taxonomy for TechStackEditor
profileRouter.get("/skills", authMiddle, (req, res) => {
  const skills = TAXONOMY.map((entry) => ({
    canonical: entry.canonical,
    category: entry.category,
    aliases: entry.aliases,
  }));
  res.json({ data: skills });
});

profileRouter.patch("/editPassword", authMiddle, async (req, res) => {
  try {
    await validateEditPassword(req);
    const { newPassword } = req.body;
    const passwordHash = await bcrypt.hash(newPassword, 10);
    await user.findByIdAndUpdate(req.user._id, { password: passwordHash }, { runValidators: true });
    res.json({ message: "Password updated successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = profileRouter;
