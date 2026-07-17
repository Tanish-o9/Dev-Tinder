const mongoose = require("mongoose");

const projectApplicationSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    applicantId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, trim: true, maxlength: 1500, default: "" },
    roleAppliedFor: { type: String, trim: true, maxlength: 80, default: "" },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  },
  { timestamps: true }
);

projectApplicationSchema.index({ projectId: 1, applicantId: 1 }, { unique: true });
module.exports = mongoose.model("ProjectApplication", projectApplicationSchema);
