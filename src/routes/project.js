const express = require("express");
const mongoose = require("mongoose");
const { authMiddle } = require("../middlewares/auth");
const Project = require("../models/project");
const ProjectApplication = require("../models/projectApplication");
const { createNotification } = require("../utils/notifications");
const { getProjectMatch } = require("../utils/projectMatch");

const projectRouter = express.Router();
const projectTypes = ["Hackathon", "Open Source", "Startup", "College Project", "Personal Project", "AI/ML Project", "Web Project", "Mobile Project", "Research", "Other"];
const collaborationModes = ["Remote", "In person", "Hybrid"];
const experienceLevels = ["Beginner", "Intermediate", "Advanced"];
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const parseTeamSize = (value) => {
  if (value === undefined) return 4;
  if (typeof value === "string" && !/^\d+$/.test(value.trim())) return NaN;
  return Number(value);
};

const sanitizeOpenRoles = (roles) => {
  if (!Array.isArray(roles)) return [];
  return roles
    .filter((r) => r && typeof r.role === "string" && r.role.trim())
    .map((r) => ({
      role: r.role.trim().slice(0, 80),
      skills: Array.isArray(r.skills) ? [...new Set(r.skills.map((s) => String(s).trim()).filter(Boolean))].slice(0, 10) : [],
      filled: Boolean(r.filled),
    }))
    .slice(0, 10);
};

const sanitizeProject = (body) => ({
  title: body.title?.trim(), summary: body.summary?.trim(), description: body.description?.trim(),
  requiredSkills: Array.isArray(body.requiredSkills) ? [...new Set(body.requiredSkills.map((skill) => String(skill).trim()).filter(Boolean))].slice(0, 20) : [],
  projectType: body.projectType || "Other", experienceLevel: body.experienceLevel || "Beginner", collaborationMode: body.collaborationMode || "Remote",
  location: body.location?.trim() || "", teamSize: parseTeamSize(body.teamSize),
  openRoles: sanitizeOpenRoles(body.openRoles),
});

const validateProject = (project) => {
  if (!project.title || !project.summary || !project.description) throw new Error("Title, summary, and description are required");
  if (project.title.length > 120 || project.summary.length > 300 || project.description.length > 5000) throw new Error("Project content is too long");
  if (!projectTypes.includes(project.projectType) || !experienceLevels.includes(project.experienceLevel) || !collaborationModes.includes(project.collaborationMode)) throw new Error("Invalid project options");
  if (!Number.isInteger(project.teamSize) || project.teamSize < 2 || project.teamSize > 20) throw new Error("Team size must be between 2 and 20");
};

projectRouter.get("/projects", authMiddle, async (req, res) => {
  try {
    if (Object.keys(req.query).some((key) => !["status", "skill", "type"].includes(key))) return res.status(400).json({ message: "Unsupported project filter" });
    const filter = { status: req.query.status || "Open" };
    if (req.query.skill !== undefined) { if (typeof req.query.skill !== "string" || !req.query.skill.trim() || req.query.skill.length > 50) return res.status(400).json({ message: "Invalid skill filter" }); filter.requiredSkills = new RegExp(`^${escapeRegex(req.query.skill.trim())}$`, "i"); }
    if (req.query.type !== undefined) { if (typeof req.query.type !== "string" || !projectTypes.includes(req.query.type)) return res.status(400).json({ message: "Invalid project type" }); filter.projectType = req.query.type; }
    const projects = await Project.find(filter).populate("ownerId", "firstName lastName photoURL developerRole skills location").sort({ createdAt: -1 }).limit(50);
    const rankedProjects = projects.map((project) => ({ ...project.toObject(), projectMatch: getProjectMatch(req.user, project) }))
      .sort((a, b) => b.projectMatch.score - a.projectMatch.score || new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ data: rankedProjects });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.post("/projects", authMiddle, async (req, res) => {
  try {
    const projectData = sanitizeProject(req.body); validateProject(projectData);
    const project = await Project.create({ ...projectData, ownerId: req.user._id, teamMembers: [req.user._id] });
    res.status(201).json({ message: "Project created successfully", data: project });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.get("/projects/mine", authMiddle, async (req, res) => {
  const projects = await Project.find({ ownerId: req.user._id }).sort({ createdAt: -1 });
  res.json({ data: projects });
});

projectRouter.patch("/projects/:projectId", authMiddle, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.projectId, ownerId: req.user._id });
    if (!project) return res.status(403).json({ message: "Only the project owner can edit this project" });
    const allowedFields = ["title", "summary", "description", "requiredSkills", "projectType", "experienceLevel", "collaborationMode", "location", "teamSize", "status", "openRoles"];
    if (Object.keys(req.body).some((key) => !allowedFields.includes(key))) return res.status(400).json({ message: "Invalid project update" });
    const updates = sanitizeProject({ ...project.toObject(), ...req.body });
    if (req.body.status !== undefined) updates.status = req.body.status;
    if (!["Open", "Team Formed", "In Progress", "Completed", "Closed"].includes(updates.status || project.status)) return res.status(400).json({ message: "Invalid project status" });
    if (updates.teamSize < project.teamMembers.length) return res.status(400).json({ message: "Team size cannot be smaller than the current team" });
    validateProject(updates);
    const updatedProject = await Project.findByIdAndUpdate(project._id, { $set: updates }, { new: true, runValidators: true });
    res.json({ message: "Project updated", data: updatedProject });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.patch("/projects/:projectId/close", authMiddle, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate({ _id: req.params.projectId, ownerId: req.user._id }, { $set: { status: "Closed" } }, { new: true });
    if (!project) return res.status(403).json({ message: "Only the project owner can close this project" });
    res.json({ message: "Project closed", data: project });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.get("/projects/:projectId", authMiddle, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("ownerId", "firstName lastName photoURL developerRole skills githubUsername").populate("teamMembers", "firstName lastName photoURL developerRole skills");
    if (!project) return res.status(404).json({ message: "Project not found" });
    const viewerApplication = await ProjectApplication.findOne({ projectId: project._id, applicantId: req.user._id }).select("status");
    const data = project.toObject();
    res.json({ data: { ...data, projectMatch: getProjectMatch(req.user, project), viewerApplicationStatus: viewerApplication?.status || null, isFull: data.teamMembers.length >= data.teamSize } });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.post("/projects/:projectId/apply", authMiddle, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project || project.status !== "Open") return res.status(404).json({ message: "This project is not open for applications" });
    if (project.ownerId.equals(req.user._id) || project.teamMembers.some((member) => member.equals(req.user._id))) return res.status(400).json({ message: "You are already on this project team" });
    const roleAppliedFor = req.body.roleAppliedFor?.trim() || "";
    if (roleAppliedFor && project.openRoles?.length) {
      const roleExists = project.openRoles.some((r) => r.role.toLowerCase() === roleAppliedFor.toLowerCase() && !r.filled);
      if (!roleExists) return res.status(400).json({ message: "That role is not available on this project" });
    }
    const application = await ProjectApplication.create({ projectId: project._id, applicantId: req.user._id, message: req.body.message?.trim() || "", roleAppliedFor });
    createNotification({
      recipient: project.ownerId,
      actor: req.user._id,
      type: "project_application",
      message: `${req.user.firstName} applied to join ${project.title}.`,
      referenceId: application._id,
      referenceModel: "ProjectApplication",
    });
    res.status(201).json({ message: "Application submitted", data: application });
  } catch (error) { res.status(error.code === 11000 ? 409 : 400).json({ message: error.code === 11000 ? "You have already applied to this project" : error.message }); }
});

projectRouter.get("/projects/:projectId/applications", authMiddle, async (req, res) => {
  const project = await Project.findOne({ _id: req.params.projectId, ownerId: req.user._id });
  if (!project) return res.status(403).json({ message: "Only the project owner can view applications" });
  const applications = await ProjectApplication.find({ projectId: project._id }).populate("applicantId", "firstName lastName photoURL developerRole skills githubUsername about").sort({ createdAt: -1 });
  res.json({ data: applications });
});

projectRouter.get("/projects/:projectId/team", authMiddle, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("teamMembers", "firstName lastName photoURL developerRole skills githubUsername");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ data: project.teamMembers });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

projectRouter.patch("/projects/:projectId/applications/:applicationId", authMiddle, async (req, res) => {
  try {
    const status = req.body.status;
    if (!["accepted", "rejected"].includes(status)) return res.status(400).json({ message: "Invalid application status" });
    const project = await Project.findOne({ _id: req.params.projectId, ownerId: req.user._id });
    if (!project) return res.status(403).json({ message: "Only the project owner can review applications" });
    const application = await ProjectApplication.findOne({ _id: req.params.applicationId, projectId: project._id, status: "pending" });
    if (!application) return res.status(404).json({ message: "Pending application not found" });
    if (status === "accepted") {
      application.status = "accepted";
      await application.save();
      const updatedProject = await Project.findOneAndUpdate(
        { _id: project._id, status: "Open", $expr: { $lt: [{ $size: "$teamMembers" }, "$teamSize"] } },
        { $addToSet: { teamMembers: application.applicantId } },
        { new: true }
      );
      if (!updatedProject) {
        application.status = "pending";
        await application.save();
        return res.status(409).json({ message: "This project is full or no longer open" });
      }
      if (updatedProject.teamMembers.length >= updatedProject.teamSize) await Project.updateOne({ _id: project._id }, { $set: { status: "Team Formed" } });
      // Mark the applied role as filled if specified
      if (application.roleAppliedFor) {
        await Project.updateOne(
          { _id: project._id, "openRoles.role": { $regex: new RegExp(`^${application.roleAppliedFor}$`, "i") } },
          { $set: { "openRoles.$.filled": true } }
        );
      }
    } else {
      application.status = "rejected";
      await application.save();
    }
    createNotification({
      recipient: application.applicantId,
      actor: req.user._id,
      type: status === "accepted" ? "project_application_accepted" : "project_application_rejected",
      message: `Your application to ${project.title} was ${status}.`,
      referenceId: application._id,
      referenceModel: "ProjectApplication",
    });
    res.json({ message: `Application ${status}`, data: application });
  } catch (error) { res.status(400).json({ message: error.message }); }
});

module.exports = projectRouter;
