const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Task = require("../models/Task");
const { createActivity } = require("../services/activityService");

async function listUsers(req, res, next) {
  try {
    const users = await User.find({ isDeleted: false }).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) { next(error); }
}

async function createUser(req, res, next) {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already registered" });

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(password, 10),
      role: role || "employee"
    });

    await createActivity({
      user: req.user._id,
      action: "CREATE",
      entityType: "User",
      entityId: user._id,
      description: `Created user ${user.name}`
    });

    res.status(201).json({ ...user.toObject(), password: undefined });
  } catch (error) { next(error); }
}

async function deleteUser(req, res, next) {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.isDeleted) return res.status(404).json({ message: "User not found" });

    user.isDeleted = true;
    await user.save();

    await Task.updateMany({ assignedTo: user._id }, { $set: { assignedTo: null } });

    await createActivity({
      user: req.user._id,
      action: "DELETE",
      entityType: "User",
      entityId: user._id,
      description: `Deleted user ${user.name}; assigned tasks became unassigned`
    });

    res.json({ message: "User deleted and tasks unassigned" });
  } catch (error) { next(error); }
}

module.exports = { listUsers, createUser, deleteUser };