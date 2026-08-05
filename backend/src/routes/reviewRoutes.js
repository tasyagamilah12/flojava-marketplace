// backend/src/routes/reviewRoutes.js
const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Kirim ulasan (Hanya customer yang pesanannya sudah selesai)
router.post("/", verifyToken, requireRole("customer"), reviewController.createReview);

// Lihat ulasan berdasarkan produk (Publik)
router.get("/product/:product_id", reviewController.getProductReviews);

module.exports = router;