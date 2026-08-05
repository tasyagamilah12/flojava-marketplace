// backend/src/routes/couponRoutes.js
const express = require("express");
const router = express.Router();
const couponController = require("../controllers/couponController");
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Validasi kupon oleh pembeli saat checkout
router.post("/validate", verifyToken, requireRole("customer"), couponController.validateCoupon);

// Pembuatan kupon baru oleh Admin
router.post("/", verifyToken, requireRole("admin"), couponController.createCoupon);

module.exports = router;