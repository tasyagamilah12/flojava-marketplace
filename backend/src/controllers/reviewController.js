// backend/src/controllers/reviewController.js
const db = require("../config/db");

// POST /api/reviews — Menambahkan ulasan baru
exports.createReview = async (req, res) => {
  try {
    const customerId = req.user.id;
    const { order_id, product_id, rating, review_text } = req.body;

    // 1. Validasi rating (1-5)
    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(400).json({ message: "Rating harus berupa angka antara 1 sampai 5." });
    }

    // 2. Validasi apakah pesanan benar-benar milik customer ini dan statusnya sudah 'completed' / diterima
    const [orders] = await db.execute(
      "SELECT * FROM orders WHERE id = ? AND customer_id = ? AND status = 'completed'",
      [order_id, customerId]
    );

    if (orders.length === 0) {
      return res.status(400).json({
        message: "Ulasan hanya dapat diberikan untuk pesanan yang sudah selesai/diterima.",
      });
    }

    // 3. Cek apakah produk ini ada dalam pesanan tersebut
    const [orderItems] = await db.execute(
      "SELECT * FROM orders WHERE id = ? AND product_id = ?",
      [order_id, product_id]
    );

    if (orderItems.length === 0) {
      return res.status(400).json({ message: "Produk tidak ditemukan dalam pesanan ini." });
    }

    // 4. Simpan ulasan ke database
    await db.execute(
      `INSERT INTO reviews (customer_id, product_id, order_id, rating, review_text, created_at)
       VALUES (?, ?, ?, ?, ?, NOW())`,
      [customerId, product_id, order_id, numRating, review_text || ""]
    );

    res.status(201).json({ message: "Ulasan dan penilaian berhasil dikirim!" });
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);
    res.status(500).json({ message: "Gagal menyimpan ulasan" });
  }
};

// GET /api/reviews/product/:product_id — Mengambil daftar ulasan & rata-rata rating produk
exports.getProductReviews = async (req, res) => {
  try {
    const { product_id } = req.params;

    // Ambil daftar ulasan beserta nama pembeli
    const [reviews] = await db.execute(
      `SELECT r.id, r.rating, r.review_text, r.created_at, u.name AS customer_name
       FROM reviews r
       JOIN users u ON r.customer_id = u.id
       WHERE r.product_id = ?
       ORDER BY r.created_at DESC`,
      [product_id]
    );

    // Hitung rata-rata rating (presisi desimal) dan total ulasan
    const [stats] = await db.execute(
      `SELECT COALESCE(AVG(rating), 0) as average_rating, COUNT(*) as total_reviews
       FROM reviews WHERE product_id = ?`,
      [product_id]
    );

    res.json({
      average_rating: Number(stats[0].average_rating).toFixed(1), // Contoh: 4.3
      total_reviews: stats[0].total_reviews,
      reviews,
    });
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);
    res.status(500).json({ message: "Gagal memuat ulasan produk" });
  }
};