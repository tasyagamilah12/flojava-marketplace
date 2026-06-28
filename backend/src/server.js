// backend/src/server.js — VERSI LENGKAP, timpa file lama dengan ini.
// Perubahan: tambah import + registrasi cartRoutes dan orderRoutes.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require('path');

require("./config/db");

const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const productRoutes = require("./routes/productRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const adminRoutes = require("./routes/adminRoutes");
const cartRoutes = require("./routes/cartRoutes");     // ← BARU
const orderRoutes = require("./routes/orderRoutes");   // ← BARU

const app = express();

// middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/products", productRoutes);
app.use("/api/vendor", vendorRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/cart", cartRoutes);     // ← BARU
app.use("/api/orders", orderRoutes);  // ← BARU

const verifyToken = require("./middleware/authMiddleware");

app.get("/api/test/protected", verifyToken, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

app.get("/", (req, res) => {
  res.send("Flojava Marketplace API Running...");
});

const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});