// backend/src/routes/cartRoutes.js
const express = require("express");
const router = express.Router();

const { getCart, addToCart, updateCartItem, removeCartItem } = require("../controllers/cartController");
const verifyToken = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

router.get("/", verifyToken, requireRole("customer"), getCart);
router.post("/add", verifyToken, requireRole("customer"), addToCart);
router.put("/:id", verifyToken, requireRole("customer"), updateCartItem);
router.delete("/:id", verifyToken, requireRole("customer"), removeCartItem);

module.exports = router;