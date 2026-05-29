exports.requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Forbidden: insufficient role",
        });
      }

      next();
    } catch (err) {
      console.error("ROLE MIDDLEWARE ERROR:", err);
      res.status(500).json({ message: "Server error" });
    }
  };
};