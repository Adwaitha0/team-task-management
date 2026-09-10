require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Workspace = require("../src/models/Workspace");
const Sprint = require("../src/models/Sprint");
const Task = require("../src/models/Task");

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Sprint.deleteMany({}),
    Task.deleteMany({})
  ]);

  const password = await bcrypt.hash("Password@123", 10);

  const [admin, manager, employee] = await User.create([
    { name: "Admin User", email: "admin@example.com", password, role: "admin" },
    { name: "Manager User", email: "manager@example.com", password, role: "manager" },
    { name: "Employee User", email: "employee@example.com", password, role: "employee" }
  ]);

  const workspace = await Workspace.create({
    name: "Product Development",
    description: "Team task management demo workspace",
    createdBy: admin._id
  });

  const sprint = await Sprint.create({
    workspace: workspace._id,
    name: "Sprint 1",
    startDate: new Date(),
    endDate: new Date(Date.now() + 14 * 86400000),
    status: "active",
    createdBy: manager._id
  });

  await Task.create([
    {
      title: "Design login page",
      description: "Create the login UI",
      priority: "High",
      status: "Todo",
      assignedTo: employee._id,
      workspace: workspace._id,
      sprint: sprint._id,
      createdBy: manager._id,
      labels: ["frontend", "auth"]
    },
    {
      title: "Build authentication API",
      description: "Implement JWT login and registration",
      priority: "High",
      status: "In Progress",
      assignedTo: employee._id,
      workspace: workspace._id,
      sprint: sprint._id,
      createdBy: manager._id,
      labels: ["backend", "auth"]
    }
  ]);

  console.log("Admin: admin@example.com / Password@123");
  console.log("Manager: manager@example.com / Password@123");
  console.log("Employee: employee@example.com / Password@123");

  await mongoose.connection.close();
}

seed().catch(async (error) => {
  console.error(error);
  await mongoose.connection.close();
  process.exit(1);
});