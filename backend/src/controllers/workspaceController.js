const Workspace = require("../models/Workspace");
const Sprint = require("../models/Sprint");
const { createActivity } = require("../services/activityService");

async function createWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.create({
      name: req.body.name,
      description: req.body.description,
      createdBy: req.user._id
    });

    await createActivity({
      user: req.user._id,
      action: "CREATE",
      entityType: "Workspace",
      entityId: workspace._id,
      description: `Created workspace ${workspace.name}`
    });

    res.status(201).json(workspace);
  } catch (error) { next(error); }
}

async function listWorkspaces(req, res, next) {
  try {
    const workspaces = await Workspace.find().populate("createdBy", "name email").sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (error) { next(error); }
}

async function getWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.params.id).populate("createdBy", "name email");
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });
    res.json(workspace);
  } catch (error) { next(error); }
}

async function updateWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    if (req.body.name !== undefined) workspace.name = req.body.name;
    if (req.body.description !== undefined) workspace.description = req.body.description;
    await workspace.save();

    await createActivity({
      user: req.user._id,
      action: "UPDATE",
      entityType: "Workspace",
      entityId: workspace._id,
      description: `Updated workspace ${workspace.name}`
    });

    res.json(workspace);
  } catch (error) { next(error); }
}

async function archiveWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    workspace.isArchived = true;
    await workspace.save();

    await createActivity({
      user: req.user._id,
      action: "ARCHIVE",
      entityType: "Workspace",
      entityId: workspace._id,
      description: `Archived workspace ${workspace.name}`
    });

    res.json({ message: "Workspace archived", workspace });
  } catch (error) { next(error); }
}

async function deleteWorkspace(req, res, next) {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const activeSprint = await Sprint.exists({
      workspace: workspace._id,
      status: "active"
    });

    if (activeSprint) {
      return res.status(400).json({
        message: "Workspaces with active sprints cannot be deleted"
      });
    }

    await workspace.deleteOne();

    await createActivity({
      user: req.user._id,
      action: "DELETE",
      entityType: "Workspace",
      entityId: workspace._id,
      description: `Deleted workspace ${workspace.name}`
    });

    res.json({ message: "Workspace deleted" });
  } catch (error) { next(error); }
}

module.exports = {
  createWorkspace,
  listWorkspaces,
  getWorkspace,
  updateWorkspace,
  archiveWorkspace,
  deleteWorkspace
};