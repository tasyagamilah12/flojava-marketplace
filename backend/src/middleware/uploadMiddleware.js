const multer = require("multer");
const path = require("path");

// storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/products");
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() + "-" + file.originalname.replace(/\s/g, "");
    cb(null, uniqueName);
  },
});

// filter file
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp"];

  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files allowed"), false);
  }

  cb(null, true);
};

exports.uploadProductImage = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
});