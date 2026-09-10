const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const controller = require("../controllers/sprintController");

router.use(protect);
router.get("/workspace/:workspaceId", controller.listSprints);
router.post("/", authorize("admin", "manager"), controller.createSprint);
router.patch("/:id", authorize("admin", "manager"), controller.updateSprint);
router.delete("/:id", authorize("admin", "manager"), controller.deleteSprint);

module.exports = router;