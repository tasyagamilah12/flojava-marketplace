// backend/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const webhookController = require("../controllers/webhookController");
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

// Rute Pesanan & Checkout (Dilindungi dengan verifikasi token & role khusus customer)
router.post("/buy-now", verifyToken, requireRole("customer"), orderController.buyNow);
router.post("/checkout", verifyToken, requireRole("customer"), orderController.checkoutCart);
router.get("/my-orders", verifyToken, requireRole("customer"), orderController.getMyOrders);

// Rute Pembayaran Midtrans Snap (Khusus customer yang memiliki pesanan)
router.get("/:id/pay", verifyToken, requireRole("customer"), orderController.getPaymentToken);

// Rute Webhook Midtrans (Tanpa verifyToken dan requireRole karena diakses langsung oleh server Midtrans)
router.post("/webhook/midtrans", webhookController.handleMidtransWebhook);

module.exports = router;