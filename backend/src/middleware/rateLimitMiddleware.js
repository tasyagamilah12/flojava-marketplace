const rateLimit = require("express-rate-limit");

exports.loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 menit
  max: 10, // maksimal 10 request
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many login attempts. Try again later.",
  },
});