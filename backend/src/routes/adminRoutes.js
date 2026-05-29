const express = require("express");
const router = express.Router();

// 1. IMPORT MIDDLEWARE (Ini yang tadi kurang)
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// 2. IMPORT CONTROLLER
const { 
  getPendingVendors, 
  verifyVendor, 
  getPendingProducts, // Tambahkan ini
  approveProduct      // Tambahkan ini
} = require("../controllers/adminController");

// --- ROUTES ---

// Rute Verifikasi Vendor
router.get("/pending-vendors", verifyToken, requireRole("admin"), getPendingVendors);
router.put("/verify-vendor/:id", verifyToken, requireRole("admin"), verifyVendor);

// Rute Verifikasi Produk (Pastikan variabel getPendingProducts & approveProduct sudah ada di controller)
router.get("/products/pending", verifyToken, requireRole("admin"), getPendingProducts);
router.put("/products/approve/:id", verifyToken, requireRole("admin"), approveProduct);

module.exports = router;