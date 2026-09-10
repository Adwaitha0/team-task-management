const Task = require("../models/Task");
const User = require("../models/User");

const transitions = {
  Todo: ["In Progress"],
  "In Progress": ["Review"],
  Review: ["Done"],
  Done: []
};

async function validateAssignment(assignedTo, currentTaskId = null) {
  if (!assignedTo) return;

  const employee = await User.findOne({
    _id: assignedTo,
    role: "employee",
    isDeleted: false
  });

  if (!employee) {
    const error = new Error("Assigned user must be an active employee");
    error.statusCode = 400;
    throw error;
  }

  const query = {
    assignedTo,
    status: { $ne: "Done" }
  };

  if (currentTaskId) query._id = { $ne: currentTaskId };

  const activeCount = await Task.countDocuments(query);

  if (activeCount >= 8) {
    const error = new Error("Employee cannot have more than 8 active tasks");
    error.statusCode = 400;
    throw error;
  }
}

function validateTransition(currentStatus, nextStatus) {
  if (currentStatus === nextStatus) return;

  if (!transitions[currentStatus]?.includes(nextStatus)) {
    const error = new Error(
      `Invalid task transition: ${currentStatus} → ${nextStatus}`
    );
    error.statusCode = 400;
    throw error;
  }
}

module.exports = { validateAssignment, validateTransition };