// frontend/src/pages/user/OrderHistory.jsx — file BARU.
//
// Ini halaman yang sebelumnya tidak ada sama sekali, sehingga klik menu
// "Riwayat Pembelian" di sidebar (Navbar.jsx) selalu nyasar ke catch-all
// route "*" di App.jsx yang redirect ke /login.
//
// Memakai Badge.jsx (sudah dikonversi sebelumnya) untuk status pesanan —
// sebelumnya status pill ditulis manual berulang-ulang di tempat lain
// (AdminDashboard.jsx, OrderList.jsx) dengan className berbeda-beda.

import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Badge } from '../../components/ui/Badge';

const STATUS_LABEL = {
  pending: 'Menunggu Diproses',
  processing: 'Diproses',
  shipped: 'Dikirim',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
};

const STATUS_VARIANT = {
  pending: 'warning',
  processing: 'info',
  shipped: 'success',
  completed: 'success',
  cancelled: 'danger',
};

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get('/orders/my-orders');
        setOrders(res.data);
      } catch (err) {
        console.error('Gagal memuat riwayat pembelian', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) return <div className="text-center py-20">Memuat riwayat pembelian... 🛍️</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-stone-800 mb-6">Riwayat Pembelian 🛍️</h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 py-20 text-center">
            <p className="text-stone-400 font-medium">Belum ada riwayat pembelian.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-5 flex items-center gap-4">
                <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                  {order.image_url && (
                    <img
                      src={`http://localhost:5050${order.image_url}`}
                      alt={order.product_name}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-stone-800 truncate">{order.product_name}</p>
                  <p className="text-xs text-stone-500">{order.vendor_name} · {order.quantity} pcs</p>
                  <p className="text-orange-900 font-bold mt-1">
                    Rp {Number(order.total_price).toLocaleString('id-ID')}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <Badge variant={STATUS_VARIANT[order.status] ?? 'muted'} size="sm">
                    {STATUS_LABEL[order.status] ?? order.status}
                  </Badge>
                  <span className="text-[11px] text-stone-400">
                    {new Date(order.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
