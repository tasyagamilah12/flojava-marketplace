const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =============================
// REGISTER VENDOR (WITH KTP)
// =============================
exports.registerVendor = async (req, res) => {
  console.log("Data masuk:", req.body); 
  console.log("File masuk:", req.file);
  try {
    const { name, email, password, role } = req.body;
    const ktp_image = req.file ? req.file.filename : null;

    // 1. Validasi Input Dasar
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "Data nama, email, password, dan role wajib diisi!" });
    }

    // 2. Logika Khusus Vendor (Wajib KTP)
    if (role === 'vendor' && !ktp_image) {
      return res.status(400).json({ message: "Pendaftaran vendor wajib mengunggah KTP!" });
    }

    // 3. Cek Email Terdaftar
    const [existing] = await db.execute("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email sudah terdaftar!" });
    }

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Tentukan Status Berdasarkan Role
    // Customer langsung 'approved', Vendor harus 'pending' dulu
    const status = (role === 'vendor') ? 'pending' : 'approved';

    // 6. Simpan ke Database
    await db.execute(
      "INSERT INTO users (name, email, password, role, ktp_image, status) VALUES (?, ?, ?, ?, ?, ?)",
      [name, email, hashedPassword, role, ktp_image, status]
    );

    res.json({
      message: role === 'vendor' 
        ? "Registrasi Vendor berhasil! Tunggu verifikasi admin." 
        : "Registrasi Pembeli berhasil! Silakan login.",
      role: role
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error saat registrasi" });
  }
};

// =============================
// LOGIN
// =============================
exports.login = async (req, res) => {
  console.time("LOGIN_FLOW");

  try {
    const { email, password } = req.body;

    const [results] = await db.execute(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = results[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Wrong password" });
    }

    // 🔐 access token
    const accessToken = jwt.sign(
      { id: user.id, role: user.role, status: user.status },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // 🔐 refresh token
    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "1d" }
    );

    // simpan refresh token
    await db.execute(
      "INSERT INTO refresh_tokens (user_id, token) VALUES (?, ?)",
      [user.id, refreshToken]
    );

    // audit log login
    await db.execute(
      "INSERT INTO audit_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
      [user.id, "LOGIN", req.ip]
    );

    console.timeEnd("LOGIN_FLOW");

    res.json({
      message: "Login success",
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address
      },
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// =============================
// REFRESH TOKEN
// =============================
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const [rows] = await db.execute(
      "SELECT * FROM refresh_tokens WHERE token=?",
      [refreshToken]
    );

    if (rows.length === 0) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    // ambil user untuk dapat role
    const [users] = await db.execute(
      "SELECT id, role FROM users WHERE id = ?",
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("REFRESH ERROR:", err);
    res.status(403).json({ message: "Invalid or expired token" });
  }
};

// =============================
// LOGOUT
// =============================
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    // decode untuk audit
    let decoded;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );
    } catch {
      decoded = { id: null };
    }

    // hapus refresh token
    await db.execute(
      "DELETE FROM refresh_tokens WHERE token=?",
      [refreshToken]
    );

    // audit log logout
    if (decoded.id) {
      await db.execute(
        "INSERT INTO audit_logs (user_id, action, ip_address) VALUES (?, ?, ?)",
        [decoded.id, "LOGOUT", req.ip]
      );
    }

    res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error("LOGOUT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, stock, description } = req.body;

    // 🔥 ambil dari JWT
    const vendorId = req.user.id;

    await db.execute(
      `INSERT INTO products (vendor_id, name, price, stock, description)
       VALUES (?, ?, ?, ?, ?)`,
      [vendorId, name, price, stock, description]
    );

    res.json({ message: "Product created" });
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, description } = req.body;

    const vendorId = Number(req.user.id);
    const userRole = req.user.role;

    // 🔍 debug sementara (boleh hapus nanti)
    console.log("UPDATE DEBUG:", {
      productId: id,
      vendorId,
      role: userRole,
    });

    // =============================
    // ADMIN → bebas update
    // =============================
    if (userRole === "admin") {
      await db.execute(
        `UPDATE products
         SET name=?, price=?, stock=?, description=?
         WHERE id=?`,
        [name, price, stock, description, id]
      );

      return res.json({ message: "Product updated (admin)" });
    }

    // =============================
    // VENDOR → hanya miliknya
    // =============================
    const [result] = await db.execute(
      `UPDATE products
       SET name=?, price=?, stock=?, description=?
       WHERE id=? AND vendor_id=?`,
      [name, price, stock, description, id, vendorId]
    );

    if (result.affectedRows === 0) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.json({ message: "Product updated" });

  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Endpoint Update Profil
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, address } = req.body;
    const userId = req.user.id; // Diambil dari verifyToken

    await db.execute(
      "UPDATE users SET name = ?, phone = ?, address = ? WHERE id = ?",
      [name, phone, address, userId]
    );

    res.json({ message: "Profil berhasil diperbarui! ✨" });
  } catch (error) {
    res.status(500).json({ message: "Gagal memperbarui profil" });
  }
};