const Sprint = require("../models/Sprint");
const Workspace = require("../models/Workspace");
const { createActivity } = require("../services/activityService");

async function createSprint(req, res, next) {
  try {
    const { workspace, name, startDate, endDate, status } = req.body;
    const ws = await Workspace.findById(workspace);
    if (!ws) return res.status(404).json({ message: "Workspace not found" });

    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({ message: "End date must be after start date" });
    }

    const sprint = await Sprint.create({
      workspace,
      name,
      startDate,
      endDate,
      status: status || "planned",
      createdBy: req.user._id
    });

    await createActivity({
      user: req.user._id,
      action: "CREATE",
      entityType: "Sprint",
      entityId: sprint._id,
      description: `Created sprint ${sprint.name}`
    });

    res.status(201).json(sprint);
  } catch (error) { next(error); }
}

async function listSprints(req, res, next) {
  try {
    const sprints = await Sprint.find({ workspace: req.params.workspaceId })
      .populate("createdBy", "name")
      .sort({ startDate: -1 });
    res.json(sprints);
  } catch (error) { next(error); }
}

async function updateSprint(req, res, next) {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    Object.assign(sprint, {
      ...(req.body.name !== undefined && { name: req.body.name }),
      ...(req.body.startDate !== undefined && { startDate: req.body.startDate }),
      ...(req.body.endDate !== undefined && { endDate: req.body.endDate }),
      ...(req.body.status !== undefined && { status: req.body.status })
    });

    await sprint.save();

    await createActivity({
      user: req.user._id,
      action: "UPDATE",
      entityType: "Sprint",
      entityId: sprint._id,
      description: `Updated sprint ${sprint.name}`
    });

    res.json(sprint);
  } catch (error) { next(error); }
}

async function deleteSprint(req, res, next) {
  try {
    const sprint = await Sprint.findById(req.params.id);
    if (!sprint) return res.status(404).json({ message: "Sprint not found" });

    await sprint.deleteOne();

    await createActivity({
      user: req.user._id,
      action: "DELETE",
      entityType: "Sprint",
      entityId: sprint._id,
      description: `Deleted sprint ${sprint.name}`
    });

    res.json({ message: "Sprint deleted" });
  } catch (error) { next(error); }
}

module.exports = { createSprint, listSprints, updateSprint, deleteSprint };