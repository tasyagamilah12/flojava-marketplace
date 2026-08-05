// backend/src/controllers/analyticsController.js
const db = require("../config/db");

// GET /api/admin/analytics/summary — Statistik ringkas untuk dashboard admin
exports.getPlatformAnalytics = async (req, res) => {
  try {
    // 1. Total Pendapatan / GMV (Gross Merchandise Value) dari pesanan yang sukses/diproses
    const [gmvResult] = await db.execute(
      `SELECT SUM(total_price) AS total_gmv, COUNT(*) AS total_orders 
       FROM orders WHERE status != 'cancelled'`
    );

    // 2. Total Pengguna berdasarkan role (Buyer vs Vendor)
    const [usersResult] = await db.execute(
      `SELECT role, COUNT(*) AS count FROM users GROUP BY role`
    );

    // 3. Total Produk aktif di platform
    const [productsResult] = await db.execute(
      `SELECT COUNT(*) AS total_products FROM products`
    );

    res.json({
      total_gmv: gmvResult[0].total_gmv || 0,
      total_orders: gmvResult[0].total_orders || 0,
      total_products: productsResult[0].total_products || 0,
      users_breakdown: usersResult,
    });
  } catch (error) {
    console.error("ANALYTICS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data analitik platform" });
  }
};