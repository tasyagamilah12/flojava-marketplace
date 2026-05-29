const db = require("../config/db");

// Ambil statistik dan daftar produk milik vendor
exports.getDashboardStats = async (req, res) => {
  try {
    // Diambil dari middleware verifyToken
    const vendorId = req.user.id; 

    // 1. Hitung jumlah produk milik vendor ini
    const [productCount] = await db.execute(
      "SELECT COUNT(*) as total FROM products WHERE vendor_id = ?",
      [vendorId]
    );

    // 2. Ambil produk untuk tabel
    const [products] = await db.execute(
      "SELECT id, name, price, stock, description FROM products WHERE vendor_id = ? ORDER BY id DESC",
      [vendorId]
    );

    res.json({
      name: req.user.name,
      status: req.user.status, // Digunakan frontend untuk cek 'approved/pending'
      totalProducts: productCount[0].total,
      products: products // Mengirim array produk agar .map() di frontend lancar
    });
  } catch (error) {
    console.error("VENDORS STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Mengambil daftar produk (Opsional, jika ingin halaman khusus daftar produk)
exports.getMyProducts = async (req, res) => {
  try {
    const vendorId = req.user.id;
    const [products] = await db.execute(
      "SELECT * FROM products WHERE vendor_id = ? ORDER BY id DESC",
      [vendorId]
    );
    res.json(products);
  } catch (error) {
    console.error("GET MY PRODUCTS ERROR:", error);
    res.status(500).json({ message: "Gagal memuat produk" });
  }
};

exports.getVendorOrders = async (req, res) => {
  try {
    const vendorId = req.user.id; // Diambil dari token JWT Chiko

    const [rows] = await db.execute(
      `SELECT 
        o.id, 
        o.quantity, 
        o.total_price, 
        o.status, 
        o.shipping_address, 
        o.created_at,
        u.name AS customer_name, 
        p.name AS product_name
      FROM orders o
      JOIN users u ON o.customer_id = u.id
      JOIN products p ON o.product_id = p.id
      WHERE o.vendor_id = ?
      ORDER BY o.created_at DESC`,
      [vendorId]
    );

    res.json(rows);
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil data pesanan" });
  }
};