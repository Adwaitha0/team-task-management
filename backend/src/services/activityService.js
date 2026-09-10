const ActivityLog = require("../models/ActivityLog");

async function createActivity({ user, action, entityType, entityId, description }) {
  return ActivityLog.create({
    user,
    action,
    entityType,
    entityId,
    description
  });
}

module.exports = { createActivity };