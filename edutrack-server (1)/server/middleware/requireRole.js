// Use after requireAuth. Restricts a route to a specific role (e.g. "instructor").
function requireRole(role) {
  return (req, res, next) => {
    if (req.userRole !== role) {
      return res.status(403).json({ error: `Only ${role}s can perform this action` });
    }
    next();
  };
}

module.exports = requireRole;
