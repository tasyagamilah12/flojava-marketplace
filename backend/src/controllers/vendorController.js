// backend/src/controllers/vendorController.js
const db = require("../config/db");

// Ambil statistik dan daftar produk milik vendor
exports.getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.user.id;

    const [productCount] = await db.execute(
      "SELECT COUNT(*) as total FROM products WHERE vendor_id = ?",
      [vendorId]
    );

    const [products] = await db.execute(
      "SELECT id, name, price, stock, description FROM products WHERE vendor_id = ? ORDER BY id DESC",
      [vendorId]
    );

    res.json({
      name: req.user.name,
      status: req.user.status,
      totalProducts: productCount[0].total,
      products: products
    });
  } catch (error) {
    console.error("VENDORS STATS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

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
    const vendorId = req.user.id;

    // Diperbarui agar turut mengambil kolom tracking_number (nomor resi) jika ada
    const [rows] = await db.execute(
      `SELECT 
        o.id, 
        o.quantity, 
        o.total_price, 
        o.status, 
        o.shipping_address, 
        o.tracking_number,
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

const ALLOWED_ORDER_STATUSES = [
  "pending",
  "processing",
  "shipped",
  "completed",
  "cancelled",
];

// Update status pesanan DAN nomor resi oleh vendor
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, tracking_number } = req.body;
    const vendorId = req.user.id;

    if (!ALLOWED_ORDER_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Gunakan salah satu dari: ${ALLOWED_ORDER_STATUSES.join(", ")}`,
      });
    }

    // Jika status diubah menjadi 'shipped', pastikan resi disertakan (opsional tapi disarankan)
    const resi = tracking_number ? tracking_number.trim() : null;

    let query = "UPDATE orders SET status = ?";
    let params = [status];

    // Jika ada input resi, masukkan ke query update
    if (resi !== undefined) {
      query += ", tracking_number = ?";
      params.push(resi);
    }

    query += " WHERE id = ? AND vendor_id = ?";
    params.push(id, vendorId);

    const [result] = await db.execute(query, params);

    if (result.affectedRows === 0) {
      return res.status(403).json({
        message: "Pesanan tidak ditemukan atau Anda tidak berhak mengubahnya",
      });
    }

    res.json({ message: `Status pesanan berhasil diperbarui menjadi '${status}'` });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};