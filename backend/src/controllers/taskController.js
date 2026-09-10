const Task = require("../models/Task");
const Workspace = require("../models/Workspace");
const Sprint = require("../models/Sprint");
const { createActivity } = require("../services/activityService");
const { validateAssignment, validateTransition } = require("../services/taskService");

async function createTask(req, res, next) {
  try {
    const { title, description, priority, dueDate, assignedTo, labels, workspace, sprint } = req.body;

    // if (!title || !workspace) {
    //   return res.status(400).json({ message: "Title and workspace are required" });
    // }

    // if (!await Workspace.exists({ _id: workspace })) {
    //   return res.status(404).json({ message: "Workspace not found" });
    // }

    // if (sprint && !await Sprint.exists({ _id: sprint, workspace })) {
    //   return res.status(400).json({ message: "Sprint does not belong to the workspace" });
    // }

    await validateAssignment(assignedTo);

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate,
      assignedTo: assignedTo || null,
      labels: labels || [],
      // workspace,
      sprint: sprint || null,
      createdBy: req.user._id
    });

    await createActivity({
      user: req.user._id,
      action: "CREATE",
      entityType: "Task",
      entityId: task._id,
      description: `Created task ${task.title}`
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name");

    req.io?.emit("taskCreated", populated);
    res.status(201).json(populated);
  } catch (error) { next(error); }
}

async function listTasks(req, res, next) {
  try {
    const query = {};
    for (const field of ["workspace", "sprint", "assignedTo", "status", "priority"]) {
      if (req.query[field]) query[field] = req.query[field];
    }

    if (req.user.role === "employee") query.assignedTo = req.user._id;

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name")
      .populate("workspace", "name")
      .populate("sprint", "name status")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) { next(error); }
}

async function getTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name")
      .populate("workspace", "name")
      .populate("sprint", "name status");

    if (!task) return res.status(404).json({ message: "Task not found" });
    if (req.user.role === "employee" && String(task.assignedTo?._id) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only view assigned tasks" });
    }

    res.json(task);
  } catch (error) { next(error); }
}

async function updateTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    if (req.user.role === "employee" && String(task.assignedTo) !== String(req.user._id)) {
      return res.status(403).json({ message: "You can only modify assigned tasks" });
    }

    if (req.body.status && req.body.status !== task.status) {
      validateTransition(task.status, req.body.status);
    }

    if (req.body.assignedTo !== undefined && String(req.body.assignedTo || "") !== String(task.assignedTo || "")) {
      await validateAssignment(req.body.assignedTo, task._id);
    }

    const oldStatus = task.status;
    const oldAssignee = task.assignedTo;

    Object.assign(task, {
      ...(req.body.title !== undefined && { title: req.body.title }),
      ...(req.body.description !== undefined && { description: req.body.description }),
      ...(req.body.priority !== undefined && { priority: req.body.priority }),
      ...(req.body.status !== undefined && { status: req.body.status }),
      ...(req.body.dueDate !== undefined && { dueDate: req.body.dueDate }),
      ...(req.body.assignedTo !== undefined && { assignedTo: req.body.assignedTo || null }),
      ...(req.body.labels !== undefined && { labels: req.body.labels }),
      ...(req.body.sprint !== undefined && { sprint: req.body.sprint || null })
    });

    await task.save();

    await createActivity({
      user: req.user._id,
      action: "UPDATE",
      entityType: "Task",
      entityId: task._id,
      description: `Updated task ${task.title}`
    });

    if (oldStatus !== task.status) {
      await createActivity({
        user: req.user._id,
        action: "STATUS_CHANGE",
        entityType: "Task",
        entityId: task._id,
        description: `Moved task ${task.title} from ${oldStatus} to ${task.status}`
      });
    }

    if (String(oldAssignee || "") !== String(task.assignedTo || "")) {
      await createActivity({
        user: req.user._id,
        action: "ASSIGN",
        entityType: "Task",
        entityId: task._id,
        description: `Changed assignee for ${task.title}`
      });
    }

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name")
      .populate("workspace", "name")
      .populate("sprint", "name status");

    req.io?.emit("taskUpdated", populated);
    res.json(populated);
  } catch (error) { next(error); }
}

async function deleteTask(req, res, next) {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    await task.deleteOne();

    await createActivity({
      user: req.user._id,
      action: "DELETE",
      entityType: "Task",
      entityId: task._id,
      description: `Deleted task ${task.title}`
    });

    req.io?.emit("taskDeleted", { taskId: task._id });
    res.json({ message: "Task deleted" });
  } catch (error) { next(error); }
}

module.exports = { createTask, listTasks, getTask, updateTask, deleteTask };