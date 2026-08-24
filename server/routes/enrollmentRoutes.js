const express = require("express");
const requireAuth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { myEnrollments } = require("../controllers/enrollmentController");

const router = express.Router();

router.use(requireAuth);

// A student's own enrolled courses with progress (feeds the "My courses" tile grid).
router.get("/me", requireRole("student"), myEnrollments);

module.exports = router;
