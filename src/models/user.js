const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
    },
    photoURL: {
      type: String,
    },
    age: {
      type: Number,
    },
    emailId: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
      required: true,
      validate(email) {
        if (!validator.isEmail(email)) {
          throw new Error("Invalid Email");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      //   enum: ["male", "female", "others"],
      validate(val) {
        if (!["male", "female", "others"].includes(val))
          throw new Error("Gender validation failed");
      },
    },
    about: {
      type: String,
    },
    skills: {
      type: [String],
      default: [],
      set: (skills) => Array.isArray(skills)
        ? [...new Set(skills.map((skill) => String(skill).trim()).filter(Boolean))].slice(0, 30)
        : [],
    },
    educationType: {
      type: String,
      enum: ["school", "college"],
    },
    institutionName: {
      type: String,
      trim: true,
      maxlength: 150,
    },
    socialLinks: {
      linkedin: { type: String, trim: true },
      github: { type: String, trim: true },
      leetcode: { type: String, trim: true },
      gfg: { type: String, trim: true },
      codechef: { type: String, trim: true },
      codeforces: { type: String, trim: true },
      hackerrank: { type: String, trim: true },
    },
    developerRole: {
      type: String,
      enum: ["Frontend Developer", "Backend Developer", "Full Stack Developer", "Mobile Developer", "AI/ML Engineer", "Data Scientist", "DevOps Engineer", "Cloud Engineer", "Cybersecurity Engineer", "UI/UX Developer", "Blockchain Developer", "Other"],
      default: "Other",
    },
    experienceLevel: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },
    collaborationInterests: {
      type: [String],
      enum: ["Hackathons", "Open Source", "Startup", "College Projects", "AI Projects", "Web Development", "Mobile Development", "Research"],
      default: [],
    },
    githubUsername: {
      type: String,
      trim: true,
      maxlength: 39,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
    },
    availability: {
      type: String,
      enum: ["Available", "Open to Opportunities", "Busy"],
      default: "Available",
    },
    savedDevelopers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    blockedUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },
);

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  //Never use arrow func here
  const user = this;
  const passwordHash = user.password;
  const isPasswordCorrect = await bcrypt.compare(
    passwordInputByUser,
    passwordHash,
  );
  return isPasswordCorrect;
};

userSchema.methods.getJWT = function () {
  const user = this;
  const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "5d",
  }); //Second parameter is SECRETKEY.. & first one is hidden userId
  return token;
};

userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  return user;
};

const User = model("User", userSchema);
module.exports = User;
