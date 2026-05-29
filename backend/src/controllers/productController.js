const db = require("../config/db");

// =============================
// CREATE PRODUCT (vendor only)
// =============================
exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;
    const vendorId = req.user.id;

    // Pastikan path ini sesuai dengan folder static di server.js
    const imageUrl = req.file ? `/products/${req.file.filename}` : null;

    const sql = `
      INSERT INTO products (vendor_id, name, price, stock, description, image_url)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    await db.execute(sql, [vendorId, name, price, stock, description, imageUrl]);

    res.status(201).json({ message: "Produk berhasil ditambahkan! ☕" });
  } catch (err) {
    console.error("CREATE ERROR:", err);
    res.status(500).json({ message: "Gagal menyimpan ke database" });
  }
};

// =============================
// GET ALL PRODUCTS (public)
// =============================
exports.getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";

    const offset = (page - 1) * limit;

    // total count
    const [countRows] = await db.execute(
      "SELECT COUNT(*) as total FROM products WHERE name LIKE ?",
      [`%${search}%`]
    );

    const total = countRows[0].total;

    // data query
    const [rows] = await db.execute(
      `SELECT p.*, u.name AS vendor_name
       FROM products p
       JOIN users u ON p.vendor_id = u.id
       WHERE p.name LIKE ? AND p.status = 'approved'
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`,
      [`%${search}%`, limit, offset]
    );

    res.json({
      data: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// UPDATE PRODUCT (vendor owner)
// =============================
exports.updateProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const { name, price, stock, description } = req.body;
    const vendorId = req.user.id;

    const sql = `
      UPDATE products
      SET name=?, price=?, stock=?, description=?
      WHERE id=? AND vendor_id=?
    `;

    const [result] = await db.execute(sql, [
      name,
      price,
      stock,
      description,
      productId,
      vendorId,
    ]);

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Product updated" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// DELETE PRODUCT (vendor owner)
// =============================
exports.deleteProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const vendorId = req.user.id;

    const [result] = await db.execute(
      "DELETE FROM products WHERE id=? AND vendor_id=?",
      [productId, vendorId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Product deleted" });
  } catch (err) {
    console.error("DELETE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};