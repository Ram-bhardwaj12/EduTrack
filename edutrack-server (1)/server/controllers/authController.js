const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

async function signup(req, res) {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: "Name, email, password, and role are required" });
    }
    if (!["student", "instructor"].includes(role)) {
      return res.status(400).json({ error: "role must be 'student' or 'instructor'" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, role });

    const token = signToken(user);
    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, title: user.title || "", bio: user.bio || "" },
    });
  } catch (err) {
    res.status(500).json({ error: "Signup failed", details: err.message });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, title: user.title || "", bio: user.bio || "" },
    });
  } catch (err) {
    res.status(500).json({ error: "Login failed", details: err.message });
  }
}

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.userId, "-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ id: user._id, name: user.name, email: user.email, role: user.role, title: user.title || "", bio: user.bio || "" });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch profile", details: err.message });
  }
}

async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, email, title, bio, newPassword } = req.body;

    if (name !== undefined && name.trim()) user.name = name.trim();
    if (title !== undefined) user.title = title.trim();
    if (bio !== undefined) user.bio = bio.trim();

    if (email !== undefined && email.trim() && email.toLowerCase() !== user.email) {
      const existing = await User.findOne({ email: email.toLowerCase() });
      if (existing && String(existing._id) !== String(user._id)) {
        return res.status(409).json({ error: "Email is already taken by another user" });
      }
      user.email = email.toLowerCase().trim();
    }

    if (newPassword && newPassword.length >= 6) {
      user.passwordHash = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, title: user.title || "", bio: user.bio || "" },
      message: "Profile updated successfully",
    });
  } catch (err) {
    res.status(500).json({ error: "Could not update profile", details: err.message });
  }
}

module.exports = { signup, login, getProfile, updateProfile };
