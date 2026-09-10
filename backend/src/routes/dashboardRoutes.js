const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const { dashboard } = require("../controllers/dashboardController");

router.use(protect);
router.get("/", dashboard);

module.exports = router;