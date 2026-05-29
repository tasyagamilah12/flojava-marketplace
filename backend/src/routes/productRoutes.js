const express = require("express");
const router = express.Router();

// 1. Import Middleware
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");
const { validateProduct } = require("../middleware/productValidation");
const { uploadProductImage } = require("../middleware/uploadMiddleware");

// 2. Import Controller (Hanya satu kali)
const {
  createProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

// --- ROUTES ---

// A. PUBLIC: Mengambil semua produk untuk pembeli
router.get("/", getAllProducts);

// B. VENDOR & ADMIN: Tambah Produk
// Pastikan uploadProductImage.single("product_image") sesuai dengan frontend
router.post(
  "/add-product",
  verifyToken,
  requireRole("vendor", "admin"),
  uploadProductImage.single("product_image"), 
  validateProduct,
  createProduct
);

// C. VENDOR & ADMIN: Update Produk
router.put(
  "/:id",
  verifyToken,
  requireRole("vendor", "admin"),
  validateProduct,
  updateProduct
);

// D. VENDOR & ADMIN: Hapus Produk
router.delete(
  "/:id",
  verifyToken,
  requireRole("vendor", "admin"),
  deleteProduct
);

module.exports = router;