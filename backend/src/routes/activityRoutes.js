const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { listActivities } = require("../controllers/activityController");

router.use(protect);
router.get("/", listActivities);

module.exports = router;