const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const controller = require("../controllers/workspaceController");

router.use(protect);
router.get("/", controller.listWorkspaces);
router.get("/:id", controller.getWorkspace);
router.post("/", authorize("admin", "manager"), controller.createWorkspace);
router.patch("/:id", authorize("admin", "manager"), controller.updateWorkspace);
router.patch("/:id/archive", authorize("admin", "manager"), controller.archiveWorkspace);
router.delete("/:id", authorize("admin"), controller.deleteWorkspace);

module.exports = router;