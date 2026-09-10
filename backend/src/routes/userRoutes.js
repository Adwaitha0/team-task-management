const router = require("express").Router();
const protect = require("../middleware/authMiddleware");
const authorize = require("../middleware/roleMiddleware");
const { listUsers, createUser, deleteUser } = require("../controllers/userController");

router.use(protect);
router.get("/", listUsers);
router.post("/", authorize("admin"), createUser);
router.delete("/:id", authorize("admin"), deleteUser);

module.exports = router;