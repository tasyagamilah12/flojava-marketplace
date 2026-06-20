// backend/src/routes/authRoutes.js — VERSI DIPERBAIKI
// Timpa (replace) seluruh isi file lama dengan ini.
//
// PERBAIKAN: baris import verifyToken diubah dari
//   const { verifyToken } = require("../middleware/authMiddleware");
// menjadi
//   const verifyToken = require("../middleware/authMiddleware");
// karena authMiddleware.js meng-export fungsinya langsung
// (module.exports = verifyToken), bukan sebagai objek
// (module.exports = { verifyToken }). Pola import harus cocok dengan
// pola export — ini yang menyebabkan server crash sebelumnya.
//
// Juga dibersihkan: import `register` dihapus karena authController.js
// tidak pernah mengekspor fungsi bernama `register` (yang dipakai untuk
// pendaftaran customer/vendor adalah `registerVendor`), jadi sebelumnya
// `register` selalu bernilai undefined tapi tidak terpakai di route manapun.

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

// 1. Import controller (hanya fungsi yang benar-benar di-export & dipakai)
const {
  login,
  refreshToken,
  logout,
  registerVendor,
  updateProfile
} = require("../controllers/authController");

// 2. Import middleware — DIPERBAIKI: tanpa destructuring, sesuai gaya
//    export authMiddleware.js (module.exports = verifyToken langsung)
const verifyToken = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

// 3. Konfigurasi penyimpanan KTP
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/ktp/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// =============================
// ROUTES
// =============================

// Route untuk registrasi vendor dengan upload KTP
router.post("/register-vendor", upload.single('ktp_image'), registerVendor);

// Route Auth Standar
router.post("/login", loginLimiter, validateLogin, login);
router.post("/refresh", refreshToken);
router.post("/logout", logout);

// Route Update Profil
router.put("/update-profile", verifyToken, updateProfile);

module.exports = router;