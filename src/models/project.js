const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    summary: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    requiredSkills: { type: [String], default: [] },
    projectType: { type: String, enum: ["Hackathon", "Open Source", "Startup", "College Project", "Personal Project", "AI/ML Project", "Web Project", "Mobile Project", "Research", "Other"], default: "Other" },
    experienceLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    collaborationMode: { type: String, enum: ["Remote", "In person", "Hybrid"], default: "Remote" },
    location: { type: String, trim: true, maxlength: 100, default: "" },
    teamSize: { type: Number, min: 2, max: 20, default: 4 },
    status: { type: String, enum: ["Open", "Team Formed", "In Progress", "Completed", "Closed"], default: "Open" },
    teamMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    openRoles: [
      {
        role: { type: String, required: true, trim: true, maxlength: 80 },
        skills: { type: [String], default: [] },
        filled: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

projectSchema.index({ status: 1, requiredSkills: 1, createdAt: -1 });
projectSchema.index({ ownerId: 1 });
module.exports = mongoose.model("Project", projectSchema);
