// backend/src/controllers/orderController.js
const db = require("../config/db");

// POST /api/orders/buy-now — body: { product_id, quantity, shipping_address }
// Membuat satu order langsung TANPA lewat keranjang.
exports.buyNow = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { product_id, quantity, shipping_address } = req.body;
    const qty = Number(quantity) > 0 ? Number(quantity) : 1;

    const [productRows] = await db.execute(
      "SELECT id, price, stock, vendor_id FROM products WHERE id = ?",
      [product_id]
    );
    if (productRows.length === 0) {
      return res.status(404).json({ message: "Produk tidak ditemukan" });
    }
    const product = productRows[0];

    if (product.stock < qty) {
      return res.status(400).json({ message: "Stok tidak mencukupi" });
    }

    const address = await resolveShippingAddress(customerId, shipping_address);
    if (!address) {
      return res.status(400).json({
        message: "Alamat pengiriman wajib diisi (belum ada alamat tersimpan di profil)",
      });
    }

    const totalPrice = Number(product.price) * qty;

    const [result] = await db.execute(
      `INSERT INTO orders (customer_id, vendor_id, product_id, quantity, total_price, shipping_address, status)
       VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
      [customerId, product.vendor_id, product_id, qty, totalPrice, address]
    );

    res.status(201).json({
      message: "Pesanan berhasil dibuat",
      order_id: result.insertId,
    });
  } catch (error) {
    console.error("BUY NOW ERROR:", error);
    res.status(500).json({ message: "Gagal membuat pesanan" });
  }
};

// POST /api/orders/checkout — body: { shipping_address }
// Mengubah SEMUA isi keranjang customer jadi order (satu baris order per produk),
// lalu mengosongkan keranjang. Dibungkus transaction supaya atomik — kalau salah
// satu produk gagal (stok habis di tengah jalan), semuanya dibatalkan, bukan
// setengah-setengah.
exports.checkoutCart = async (req, res) => {
  const pool = db;
  const connection = await pool.getConnection();

  try {
    const customerId = req.user.id;
    const { shipping_address } = req.body;

    const address = await resolveShippingAddress(customerId, shipping_address);
    if (!address) {
      connection.release();
      return res.status(400).json({
        message: "Alamat pengiriman wajib diisi (belum ada alamat tersimpan di profil)",
      });
    }

    await connection.beginTransaction();

    const [cartItems] = await connection.execute(
      `SELECT ci.id AS cart_item_id, ci.product_id, ci.quantity,
              p.price, p.stock, p.vendor_id
       FROM cart_items ci
       JOIN products p ON ci.product_id = p.id
       WHERE ci.customer_id = ?`,
      [customerId]
    );

    if (cartItems.length === 0) {
      await connection.rollback();
      connection.release();
      return res.status(400).json({ message: "Keranjang kosong" });
    }

    const createdOrderIds = [];

    for (const item of cartItems) {
      if (item.stock < item.quantity) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({
          message: `Stok tidak mencukupi untuk salah satu produk di keranjang (product_id: ${item.product_id})`,
        });
      }

      const totalPrice = Number(item.price) * item.quantity;

      const [result] = await connection.execute(
        `INSERT INTO orders (customer_id, vendor_id, product_id, quantity, total_price, shipping_address, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [customerId, item.vendor_id, item.product_id, item.quantity, totalPrice, address]
      );
      createdOrderIds.push(result.insertId);
    }

    // Kosongkan keranjang setelah semua order berhasil dibuat
    await connection.execute("DELETE FROM cart_items WHERE customer_id = ?", [customerId]);

    await connection.commit();
    connection.release();

    res.status(201).json({
      message: "Checkout berhasil",
      order_ids: createdOrderIds,
    });
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("CHECKOUT ERROR:", error);
    res.status(500).json({ message: "Gagal melakukan checkout" });
  }
};

// GET /api/orders/my-orders — riwayat pembelian customer
exports.getMyOrders = async (req, res) => {
  try {
    const customerId = req.user.id;

    const [orders] = await db.execute(
      `SELECT
        o.id, o.quantity, o.total_price, o.status, o.shipping_address, o.created_at,
        p.id AS product_id, p.name AS product_name, p.image_url,
        u.name AS vendor_name
      FROM orders o
      JOIN products p ON o.product_id = p.id
      JOIN users u ON o.vendor_id = u.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC`,
      [customerId]
    );

    res.json(orders);
  } catch (error) {
    console.error("GET MY ORDERS ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil riwayat pembelian" });
  }
};

// ── Helper ──────────────────────────────────────────────────────────────
// Pakai alamat dari body request kalau dikirim; kalau tidak, fallback ke
// alamat yang sudah tersimpan di profil user (kolom users.address).
async function resolveShippingAddress(customerId, bodyAddress) {
  if (bodyAddress && bodyAddress.trim().length > 0) {
    return bodyAddress.trim();
  }
  const [rows] = await db.execute("SELECT address FROM users WHERE id = ?", [customerId]);
  const profileAddress = rows[0]?.address;
  return profileAddress && profileAddress.trim().length > 0 ? profileAddress.trim() : null;
}