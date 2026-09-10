const ActivityLog = require("../models/ActivityLog");

async function listActivities(req, res, next) {
  try {
    const query = {};
    if (req.query.entityType) query.entityType = req.query.entityType;
    if (req.query.entityId) query.entityId = req.query.entityId;

    const logs = await ActivityLog.find(query)
      .populate("user", "name email role")
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(logs);
  } catch (error) { next(error); }
}

module.exports = { listActivities };