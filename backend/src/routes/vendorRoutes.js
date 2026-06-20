// ─────────────────────────────────────────────────────────────────────────
// backend/src/routes/vendorRoutes.js — VERSI LENGKAP
// Ini adalah file vendorRoutes.js kamu yang sudah ada, DITAMBAH satu route
// baru di bagian bawah: PUT /api/vendor/orders/:id/status
//
// Cukup timpa (replace) seluruh isi file vendorRoutes.js kamu dengan ini.
// ─────────────────────────────────────────────────────────────────────────

const express = require("express");
const router = express.Router();

const {
  getDashboardStats,
  getMyProducts,
  getVendorOrders,
  updateOrderStatus, // ← BARU: import fungsi yang ditambahkan di vendorController.js
} = require("../controllers/vendorController");

const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Endpoint: /api/vendor/dashboard-stats
router.get("/dashboard-stats", verifyToken, getDashboardStats);

// Endpoint: /api/vendor/my-products
router.get("/my-products", verifyToken, getMyProducts);

// Rute untuk melihat pesanan masuk milik vendor
router.get("/orders", verifyToken, requireRole("vendor"), getVendorOrders);

// ── BARU ─────────────────────────────────────────────────────────────────
// Endpoint: PUT /api/vendor/orders/:id/status
// Sudah dipanggil dari frontend/src/pages/vendor/OrderList.jsx tapi belum
// pernah didefinisikan di sini — inilah yang menyebabkan tombol update
// status pesanan tidak berfungsi.
router.put("/orders/:id/status", verifyToken, requireRole("vendor"), updateOrderStatus);

module.exports = router;