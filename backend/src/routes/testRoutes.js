const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// vendor only
router.get(
  "/vendor-only",
  authMiddleware,
  requireRole("vendor"),
  (req, res) => {
    res.json({ message: "Vendor access granted" });
  }
);

// admin only
router.get(
  "/admin-only",
  authMiddleware,
  requireRole("admin"),
  (req, res) => {
    res.json({ message: "Welcome admin" });
  }
);

// protected
router.get("/protected", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user,
  });
});

module.exports = router;