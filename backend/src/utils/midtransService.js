const midtransClient = require('midtrans-client');

// Inisialisasi Snap API Client
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

/**
 * Membuat Snap Token untuk pembayaran
 * @param {Object} order - Data pesanan (id, total_price, dll)
 * @param {Object} customer - Data pembeli (name, email)
 */
async function createSnapToken(order, customer) {
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${order.id}-${Date.now()}`,
      gross_amount: Number(order.total_price),
    },
    customer_details: {
      first_name: customer.name,
      email: customer.email,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);
    return transaction.token; // Token ini yang dikirim ke frontend untuk membuka popup Midtrans
  } catch (error) {
    console.error("MIDTRANS SNAP ERROR:", error);
    throw new Error("Gagal membuat token pembayaran");
  }
}

module.exports = { snap, createSnapToken };