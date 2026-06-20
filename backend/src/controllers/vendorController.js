// backend/src/controllers/vendorController.js
// VERSI LENGKAP — timpa (replace) seluruh isi file lama kamu dengan ini.
//
// Perubahan dari file lama kamu:
//   1. getDashboardStats, getMyProducts, getVendorOrders → TIDAK DIUBAH SAMA SEKALI
//   2. updateOrderStatus → BARU, ditambahkan di bagian bawah
//
// Whitelist status disesuaikan PERSIS dengan ENUM asli di database
// (dikonfirmasi dari hasil DESCRIBE orders milikmu):
//   enum('pending','processing','shipped','completed','cancelled')

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
    const vendorId = req.user.id; // Diambil dari token JWT

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

// ─────────────────────────────────────────────────────────────────────────
// BARU: Update status pesanan oleh vendor
// (pending → processing → shipped → completed, atau → cancelled)
//
// Endpoint ini sebelumnya SUDAH dipanggil dari frontend
// (frontend/src/pages/vendor/OrderList.jsx) tapi belum ada di backend —
// inilah penyebab tombol "Proses & Kemas" / "Kirim Barang" tidak berfungsi.
// ─────────────────────────────────────────────────────────────────────────

// Whitelist ini HARUS persis sama dengan nilai ENUM kolom `status`
// di tabel `orders`. Kalau nanti kamu mengubah ENUM di database,
// update juga whitelist ini supaya tetap sinkron.
const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const vendorId = req.user.id;

    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Gunakan salah satu dari: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    const [result] = await db.execute(
      "UPDATE orders SET status = ? WHERE id = ? AND vendor_id = ?",
      [status, id, vendorId]
    );

    if (result.affectedRows === 0) {
      // Bisa karena order tidak ditemukan, ATAU order itu milik vendor lain.
      // Sengaja tidak dibedakan pesannya — mencegah vendor lain "menebak"
      // ID order yang valid milik vendor lain (information leak kecil).
      return res.status(403).json({
        message: "Pesanan tidak ditemukan atau Anda tidak berhak mengubahnya",
      });
    }

    res.json({ message: `Status pesanan berhasil diubah menjadi '${status}'` });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};