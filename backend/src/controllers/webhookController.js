const db = require("../config/db");
const crypto = require("crypto");

exports.handleMidtransWebhook = async (req, res) => {
  try {
    const notification = req.body;
    
    const orderIdString = notification.order_id; // Format: ORDER-{id}-{timestamp}
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const serverKey = process.env.MIDTRANS_SERVER_KEY;

    // Validasi Signature Key untuk keamanan (Opsional tapi Best Practice)
    const computedSignature = crypto
      .createHash("sha512")
      .update(orderIdString + notification.status_code + notification.gross_amount + serverKey)
      .digest("hex");

    if (computedSignature !== notification.signature_key) {
      return res.status(403).json({ message: "Invalid signature key" });
    }

    // Ekstrak ID asli pesanan dari string order_id
    const parts = orderIdString.split("-");
    const orderId = parts[1]; // Mengambil bagian {id}

    let newStatus = "pending";

    if (transactionStatus == "capture") {
      if (fraudStatus == "accept") {
        newStatus = "processing"; // Pembayaran sukses kartu kredit
      }
    } else if (transactionStatus == "settlement") {
      newStatus = "processing"; // Pembayaran sukses (VA, QRIS, E-Wallet lunas)
    } else if (
      transactionStatus == "cancel" ||
      transactionStatus == "deny" ||
      transactionStatus == "expire"
    ) {
      newStatus = "cancelled"; // Pembayaran gagal / kedaluwarsa
    } else if (transactionStatus == "pending") {
      newStatus = "pending";
    }

    // Update status pesanan di database MySQL
    await db.execute(
      "UPDATE orders SET status = ? WHERE id = ?",
      [newStatus, orderId]
    );

    return res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("WEBHOOK ERROR:", error);
    res.status(500).json({ message: "Server error handling webhook" });
  }
};