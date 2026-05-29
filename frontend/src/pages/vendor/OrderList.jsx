import { useState, useEffect } from 'react';
import api from '../../api/axios';

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. Ambil data pesanan dari backend
  const fetchOrders = async () => {
    try {
      // Pastikan endpoint ini sudah kamu buat di backend
      const res = await api.get('/vendor/orders');
      setOrders(res.data);
    } catch (err) {
      console.error("Gagal memuat pesanan", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // 2. Fungsi update status (Misal: Kemas -> Kirim)
  const updateStatus = async (orderId, newStatus) => {
    try {
      await api.put(`/vendor/orders/${orderId}/status`, { status: newStatus });
      alert("Status pesanan diperbarui!");
      fetchOrders(); // Refresh data
    } catch (err) {
      alert("Gagal memperbarui status");
    }
  };

  if (loading) return <div className="p-10 text-center">Memuat pesanan... ☕</div>;

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-black text-stone-800 uppercase tracking-tight">Pesanan Masuk 📦</h1>
          <p className="text-stone-500 font-medium">Kelola permintaan pelanggan Flojava</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-stone-200">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b text-stone-500 uppercase text-xs font-black">
              <tr>
                <th className="p-6">ID Pesanan</th>
                <th className="p-6">Produk</th>
                <th className="p-6">Pembeli</th>
                <th className="p-6">Total Harga</th>
                <th className="p-6">Status</th>
                <th className="p-6 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-20 text-center text-stone-400 font-medium">
                    Belum ada pesanan masuk. Semangat promosi! ☕
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/50 transition">
                    <td className="p-6 font-mono text-sm text-orange-900 font-bold">#{order.id}</td>
                    <td className="p-6">
                      <p className="font-bold text-stone-800">{order.product_name}</p>
                      <p className="text-xs text-stone-500">{order.quantity} pcs</p>
                    </td>
                    <td className="p-6">
                      <p className="font-medium text-stone-800">{order.customer_name}</p>
                      <p className="text-xs text-stone-400">{order.shipping_address}</p>
                    </td>
                    <td className="p-6 font-bold text-stone-800">
                      Rp {Number(order.total_price).toLocaleString('id-ID')}
                    </td>
                    <td className="p-6">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        {order.status === 'pending' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'processing')}
                            className="bg-orange-900 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-800"
                          >
                            Proses & Kemas
                          </button>
                        )}
                        {order.status === 'processing' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'shipped')}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-green-700"
                          >
                            Kirim Barang
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default OrderList;