// src/middleware/validationMiddleware.js

exports.validateRegister = (req, res, next) => {
  const { name, email, password, role } = req.body;

  // required fields
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
    });
  }

  // email format basic
  const emailRegex = /\S+@\S+\.\S+/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
    });
  }

  // password strength minimal
  if (password.length < 6) {
    return res.status(400).json({
      message: "Password must be at least 6 characters",
    });
  }

  // role whitelist (ANTI INJECTION ROLE)
  const allowedRoles = ["admin", "vendor", "customer"];
  if (role && !allowedRoles.includes(role)) {
    return res.status(400).json({
      message: "Invalid role",
    });
  }

  next();
};

exports.validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
    });
  }

  next();
};