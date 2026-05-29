const express = require("express");
const router = express.Router();
const multer = require("multer"); 
const path = require("path");

// 1. Gabungkan semua import controller di satu tempat
const {
  register,
  login,
  refreshToken,
  logout,
  registerVendor,
  updateProfile
} = require("../controllers/authController");

// 2. Gabungkan semua import middleware
const { verifyToken } = require("../middleware/authMiddleware");
const { validateRegister, validateLogin } = require("../middleware/validationMiddleware");
const { loginLimiter } = require("../middleware/rateLimitMiddleware");

// 3. Konfigurasi penyimpanan KTP (Cukup tulis 1 kali)
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

// Route Update Profil (Sudah diperbaiki)
router.put("/update-profile", verifyToken, updateProfile);

module.exports = router;