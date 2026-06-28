// backend/src/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

const { buyNow, checkoutCart, getMyOrders } = require("../controllers/orderController");
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.post("/buy-now", verifyToken, requireRole("customer"), buyNow);
router.post("/checkout", verifyToken, requireRole("customer"), checkoutCart);
router.get("/my-orders", verifyToken, requireRole("customer"), getMyOrders);

module.exports = router;