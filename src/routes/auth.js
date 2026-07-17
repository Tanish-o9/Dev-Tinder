const express = require("express");
const validator = require("validator");
const user = require("../models/user");
const authRouter = express.Router();
const bcrypt = require("bcrypt");
const { validateSignUpData, normalizeProfileData } = require("../utils/validation");
const { getProfileCompletion, getProfileSuggestions } = require("../utils/profileCompletion");

const serializeUser = (userDocument) => {
  const profile = userDocument.toJSON();
  return { ...profile, profileCompletion: getProfileCompletion(profile).score, profileSuggestions: getProfileSuggestions(profile) };
};

// Cookie lifetime matches JWT expiry (5 days)
const COOKIE_MAX_AGE_MS = 5 * 24 * 60 * 60 * 1000;

const setAuthCookie = (res, token) => {
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(Date.now() + COOKIE_MAX_AGE_MS),
  });
};

authRouter.post("/signup", async (req, res) => {
  try {
    normalizeProfileData(req.body);
    if (typeof req.body.emailId === "string") {
      req.body.emailId = req.body.emailId.trim().toLowerCase();
    }
    validateSignUpData(req);
    const doUserExist = await user.findOne({ emailId: req.body.emailId });
    if (doUserExist)
      return res.status(409).json({ message: "User already registered. Please log in instead" });
    const { password } = req.body;
    const passwordEncrypted = await bcrypt.hash(password, 10);
    const User = new user({ ...req.body, password: passwordEncrypted });
    const savedUser = await User.save();
    const jwtToken = savedUser.getJWT();
    setAuthCookie(res, jwtToken);
    res.status(201).json({ message: "User registered successfully", data: serializeUser(savedUser) });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const emailId = req.body.emailId?.trim().toLowerCase();
    const { password } = req.body;
    if (!emailId || !password) return res.status(400).json({ message: "Email and password are required" });
    if (!validator.isEmail(emailId)) return res.status(400).json({ message: "Invalid email" });
    const UserPresent = await user.findOne({ emailId });
    if (!UserPresent) return res.status(401).json({ message: "Invalid credentials" });
    const isPasswordCorrect = await UserPresent.validatePassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid credentials" });
    const jwtToken = UserPresent.getJWT();
    setAuthCookie(res, jwtToken);
    res.status(200).json({ message: "User loggedIn successfully", data: serializeUser(UserPresent) });
  } catch (error) {
    res.status(500).json({ message: "Login failed" });
  }
});

authRouter.post("/logout", (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logged out successfully" });
});

module.exports = authRouter;
