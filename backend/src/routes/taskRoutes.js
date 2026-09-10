const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const controller = require("../controllers/taskController");

router.use(protect);
router.get("/", controller.listTasks);
router.get("/:id", controller.getTask);
router.post("/", authorize("admin", "manager"), controller.createTask);
router.patch("/:id", controller.updateTask);
router.delete("/:id", authorize("admin", "manager"), controller.deleteTask);

module.exports = router;