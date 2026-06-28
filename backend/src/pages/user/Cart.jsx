// frontend/src/pages/user/Cart.jsx — sebelumnya kosong, sekarang diisi.

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setItems(res.data.items);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Gagal memuat keranjang', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdateQty = async (cartItemId, newQty) => {
    if (newQty < 1) return;
    try {
      await api.put(`/cart/${cartItemId}`, { quantity: newQty });
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah jumlah');
    }
  };

  const handleRemove = async (cartItemId) => {
    try {
      await api.delete(`/cart/${cartItemId}`);
      fetchCart();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menghapus item');
    }
  };

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    try {
      await api.post('/orders/checkout');
      alert('Checkout berhasil! Pesanan kamu sedang diproses. ☕');
      navigate('/orders');
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal checkout';
      alert(msg);
      if (msg.includes('Alamat')) navigate('/profile');
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (loading) return <div className="text-center py-20">Memuat keranjang... 🛒</div>;

  return (
    <div className="min-h-screen bg-stone-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-black text-stone-800 mb-6">Keranjang Saya 🛒</h1>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border-2 border-dashed border-stone-200 py-20 text-center">
            <p className="text-stone-400 font-medium mb-4">Keranjang kamu masih kosong.</p>
            <button
              onClick={() => navigate('/')}
              className="bg-orange-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-orange-800 transition"
            >
              Mulai Belanja
            </button>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 divide-y">
              {items.map((item) => (
                <div key={item.cart_item_id} className="p-5 flex items-center gap-4">
                  <div className="w-16 h-16 bg-stone-100 rounded-xl overflow-hidden shrink-0">
                    {item.image_url && (
                      <img
                        src={`http://localhost:5050${item.image_url}`}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-stone-800 truncate">{item.name}</p>
                    <p className="text-xs text-stone-500">{item.vendor_name}</p>
                    <p className="text-orange-900 font-bold mt-1">
                      Rp {Number(item.price).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleUpdateQty(item.cart_item_id, item.quantity - 1)}
                      className="w-8 h-8 rounded-lg border border-stone-300 hover:bg-stone-100 font-bold"
                    >
                      −
                    </button>
                    <span className="w-6 text-center font-bold">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQty(item.cart_item_id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="w-8 h-8 rounded-lg border border-stone-300 hover:bg-stone-100 font-bold disabled:opacity-40"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemove(item.cart_item_id)}
                    aria-label="Hapus item"
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-stone-200 mt-6 p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-500">Total Belanja</p>
                <p className="text-2xl font-black text-orange-900">
                  Rp {Number(total).toLocaleString('id-ID')}
                </p>
              </div>
              <button
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="bg-orange-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-800 transition disabled:bg-stone-300"
              >
                {isCheckingOut ? 'Memproses...' : 'Checkout'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Cart;
