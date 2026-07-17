const mongoose = require("mongoose");

const REASONS = ["Spam", "Harassment", "Fake Profile", "Inappropriate Content", "Other"];

const reportSchema = new mongoose.Schema({
  reporter: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reportedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true, enum: REASONS },
  description: { type: String, trim: true, maxlength: 1000, default: "" },
  status: { type: String, enum: ["pending", "reviewed", "dismissed"], default: "pending" },
}, { timestamps: true });

// One report per reporter/reportedUser pair — prevents duplicate spam
reportSchema.index({ reporter: 1, reportedUser: 1 }, { unique: true });

reportSchema.statics.REASONS = REASONS;

module.exports = mongoose.model("Report", reportSchema);
