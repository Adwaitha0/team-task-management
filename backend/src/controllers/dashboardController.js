const Task = require("../models/Task");
const User = require("../models/User");

async function dashboard(req, res, next) {
  try {
    const base = req.user.role === "employee"
      ? { assignedTo: req.user._id }
      : {};

    const [total, completed, overdue, byStatus, byPriority, employees] = await Promise.all([
      Task.countDocuments(base),
      Task.countDocuments({ ...base, status: "Done" }),
      Task.countDocuments({
        ...base,
        status: { $ne: "Done" },
        dueDate: { $lt: new Date(), $ne: null }
      }),
      Task.aggregate([
        { $match: base },
        { $group: { _id: "$status", count: { $sum: 1 } } }
      ]),
      Task.aggregate([
        { $match: base },
        { $group: { _id: "$priority", count: { $sum: 1 } } }
      ]),
      req.user.role === "employee"
        ? []
        : Task.aggregate([
            { $match: { assignedTo: { $ne: null } } },
            { $group: {
              _id: "$assignedTo",
              total: { $sum: 1 },
              completed: {
                $sum: { $cond: [{ $eq: ["$status", "Done"] }, 1, 0] }
              },
              active: {
                $sum: { $cond: [{ $ne: ["$status", "Done"] }, 1, 0] }
              }
            }},
            { $sort: { active: -1 } }
          ])
    ]);

    const employeeIds = employees.map((e) => e._id);
    const users = employeeIds.length
      ? await User.find({ _id: { $in: employeeIds } }).select("name email")
      : [];

    const employeeStats = employees.map((stat) => ({
      ...stat,
      user: users.find((u) => String(u._id) === String(stat._id))
    }));

    const normalize = (items) => Object.fromEntries(items.map((x) => [x._id, x.count]));

    res.json({
      total,
      completed,
      overdue,
      byStatus: normalize(byStatus),
      byPriority: normalize(byPriority),
      employeeStats
    });
  } catch (error) { next(error); }
}

module.exports = { dashboard };