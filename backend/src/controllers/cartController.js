// backend/src/controllers/cartController.js
const db = require("../config/db");

// GET /api/cart — daftar isi keranjang milik customer yang login
exports.getCart = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [items] = await db.execute(
      `SELECT
        ci.id AS cart_item_id,
        ci.quantity,
        p.id AS product_id,
        p.name,
        p.price,
        p.stock,
        p.image_url,
        p.vendor_id,
        u.name AS vendor_name
      FROM cart_items ci
      JOIN products p ON ci.product_id = p.id
      JOIN users u ON p.vendor_id = u.id
      WHERE ci.customer_id = ?
      ORDER BY ci.created_at DESC`,
      [customerId]
    );

    const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    res.json({ items, total });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    res.status(500).json({ message: "Gagal memuat keranjang" });
  }
};

// POST /api/cart/add — body: { product_id, quantity }
exports.addToCart = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { product_id, quantity } = req.body;
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    if (!product_id) {
      return res.status(400).json({ message: "product_id wajib diisi" });
    }

    const [productRows] = await db.execute(
      "SELECT id, stock FROM products WHERE id = ?",
      [product_id]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    if (productRows[0].stock < qty) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    // Upsert: kalau produk sudah ada di cart, tambah quantity-nya
    await db.execute(
      `INSERT INTO cart_items (customer_id, product_id, quantity)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)`,
      [customerId, product_id, qty]
    );

    res.json({ message: "Produk ditambahkan ke keranjang" });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    res.status(500).json({ message: "Gagal menambahkan ke keranjang" });
  }
};

// PUT /api/cart/:id — body: { quantity }
exports.updateCartItem = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;
    const { quantity } = req.body;
    const qty = Number(quantity);

    if (!Number.isFinite(qty) || qty < 1) {
      return res.status(400).json({ message: "quantity harus angka >= 1" });
    }

    const [result] = await db.execute(
      "UPDATE cart_items SET quantity = ? WHERE id = ? AND customer_id = ?",
      [qty, id, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item keranjang tidak ditemukan" });
    }

    res.json({ message: "Keranjang diperbarui" });
  } catch (error) {
    console.error("UPDATE CART ITEM ERROR:", error);
    res.status(500).json({ message: "Gagal memperbarui keranjang" });
  }
};

// DELETE /api/cart/:id
exports.removeCartItem = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { id } = req.params;

    const [result] = await db.execute(
      "DELETE FROM cart_items WHERE id = ? AND customer_id = ?",
      [id, customerId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item keranjang tidak ditemukan" });
    }

    res.json({ message: "Item dihapus dari keranjang" });
  } catch (error) {
    console.error("REMOVE CART ITEM ERROR:", error);
    res.status(500).json({ message: "Gagal menghapus item" });
  }
};