exports.validateProduct = (req, res, next) => {
  const { name, price, stock } = req.body;

  // name
  if (!name || name.trim().length < 3) {
    return res.status(400).json({
      message: "Product name minimal 3 characters",
    });
  }

  // price
  if (price == null || isNaN(price) || Number(price) <= 0) {
    return res.status(400).json({
      message: "Price must be greater than 0",
    });
  }

  // stock
  if (stock == null || isNaN(stock) || Number(stock) < 0) {
    return res.status(400).json({
      message: "Stock cannot be negative",
    });
  }

  next();
};