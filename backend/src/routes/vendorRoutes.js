const express = require("express");
const router = express.Router();

const { 
  getDashboardStats, 
  getMyProducts, 
  getVendorOrders 
} = require("../controllers/vendorController"); 

const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Endpoint: /api/vendor/dashboard-stats
router.get("/dashboard-stats", verifyToken, getDashboardStats);

// Endpoint: /api/vendor/my-products
router.get("/my-products", verifyToken, getMyProducts);

// Rute untuk melihat pesanan masuk milik vendor
router.get("/orders", verifyToken, requireRole("vendor"), getVendorOrders);

module.exports = router;