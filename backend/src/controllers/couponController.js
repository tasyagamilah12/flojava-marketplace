// backend/src/controllers/couponController.js
const db = require("../config/db");

// POST /api/coupons/validate — Memeriksa validitas kode kupon yang dimasukkan pembeli
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Kode kupon wajib diisi." });
    }

    // Cari kupon berdasarkan kode yang aktif dan belum kedaluwarsa
    const [coupons] = await db.execute(
      `SELECT * FROM coupons WHERE code = ? AND is_active = TRUE AND expires_at >= NOW()`,
      [code.trim().toUpperCase()]
    );

    if (coupons.length === 0) {
      return res.status(404).json({ message: "Kode kupon tidak valid atau sudah kedaluwarsa." });
    }

    const coupon = coupons[0];

    res.status(200).json({
      message: "Kupon berhasil diterapkan!",
      coupon: {
        code: coupon.code,
        discount_percent: Number(coupon.discount_percent),
      },
    });
  } catch (error) {
    console.error("VALIDATE COUPON ERROR:", error);
    res.status(500).json({ message: "Gagal memproses kupon." });
  }
};

// POST /api/admin/coupons — Admin membuat kupon baru
exports.createCoupon = async (req, res) => {
  try {
    const { code, discount_percent, expires_at } = req.body;

    if (!code || !discount_percent || !expires_at) {
      return res.status(400).json({ message: "Semua kolom kupon wajib diisi." });
    }

    await db.execute(
      `INSERT INTO coupons (code, discount_percent, expires_at) VALUES (?, ?, ?)`,
      [code.trim().toUpperCase(), discount_percent, expires_at]
    );

    res.status(201).json({ message: "Kupon diskon berhasil dibuat!" });
  } catch (error) {
    console.error("CREATE COUPON ERROR:", error);
    res.status(500).json({ message: "Gagal membuat kupon baru." });
  }
};