const express = require("express");
const requireAuth = require("../middleware/auth");
const { signup, login, getProfile, updateProfile } = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", requireAuth, getProfile);
router.put("/me", requireAuth, updateProfile);

module.exports = router;
