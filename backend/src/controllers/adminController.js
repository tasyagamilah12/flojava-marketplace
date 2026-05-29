const db = require("../config/db");

// Ambil semua vendor yang berstatus pending
exports.getPendingVendors = async (req, res) => {
  try {
    const [vendors] = await db.execute(
      "SELECT id, name, email, ktp_image, status FROM users WHERE role = 'vendor' AND status = 'pending'"
    );
    res.json(vendors);
  } catch (error) {
    console.error("GET PENDING VENDORS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update status verifikasi (Approve/Reject)
exports.verifyVendor = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' atau 'rejected'

    await db.execute(
      "UPDATE users SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ message: `Vendor status updated to ${status}` });
  } catch (error) {
    console.error("VERIFY VENDOR ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPendingProducts = async (req, res) => {
  try {
    const [rows] = await db.execute(
      `SELECT p.*, u.name as vendor_name FROM products p 
       JOIN users u ON p.vendor_id = u.id 
       WHERE p.status = 'pending'`
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Gagal mengambil antrean produk" });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await db.execute("UPDATE products SET status = 'approved' WHERE id = ?", [id]);
    res.json({ message: "Produk berhasil disetujui dan tayang!" });
  } catch (error) {
    res.status(500).json({ message: "Gagal menyetujui produk" });
  }
};