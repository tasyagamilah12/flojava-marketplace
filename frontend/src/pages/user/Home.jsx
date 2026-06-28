// frontend/src/pages/user/Home.jsx — VERSI LENGKAP, timpa file lama.
//
// Perubahan dari laporan PDF kamu:
//   1. Search box lokal dihapus — sekarang pakai SearchContext yang sama
//      dengan search box di Navbar (cuma 1 search yang aktif)
//   2. Caption "Kualitas terbaik dari petani Nusantara" dihapus — diganti
//      heading lebih ringkas tanpa subtext generik
//   3. Tombol "Tambah ke Keranjang" (yang sebelumnya tidak berfungsi sama
//      sekali) diganti jadi dua tombol terpisah:
//        - "Beli Sekarang" (utama) → langsung buat order via /api/orders/buy-now
//        - Icon keranjang (sekunder, warna senada) → /api/cart/add

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useSearch } from '../../context/SearchContext';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const { searchTerm } = useSearch();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get(`/products`);
                if (res.data && res.data.data) {
                    setProducts(res.data.data);
                }
            } catch (err) {
                console.error("Gagal ambil produk", err);
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleBuyNow = async (product) => {
        setActionLoadingId(product.id);
        try {
            const res = await api.post('/orders/buy-now', {
                product_id: product.id,
                quantity: 1,
            });
            alert('Pesanan berhasil dibuat! ☕');
            navigate('/orders');
        } catch (err) {
            const msg = err.response?.data?.message || 'Gagal membuat pesanan';
            alert(msg);
            // Kalau gagal karena belum ada alamat tersimpan, arahkan ke profil
            if (msg.includes('Alamat')) {
                navigate('/profile');
            }
        } finally {
            setActionLoadingId(null);
        }
    };

    const handleAddToCart = async (product) => {
        setActionLoadingId(product.id);
        try {
            await api.post('/cart/add', { product_id: product.id, quantity: 1 });
            alert('Ditambahkan ke keranjang ☕🛒');
        } catch (err) {
            alert(err.response?.data?.message || 'Gagal menambahkan ke keranjang');
        } finally {
            setActionLoadingId(null);
        }
    };

    if (loading) return <div className="text-center py-20">Memuat kopi terbaik... ☕</div>;

    return (
        <div className="min-h-screen bg-stone-50">
            <main className="p-10 max-w-7xl mx-auto">
                <header className="mb-8">
                    <h2 className="text-3xl font-extrabold text-stone-800">Koleksi Kopi & Rempah ☕</h2>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => {
                            const isAvailable = Number(p.stock) > 0;
                            const isActionLoading = actionLoadingId === p.id;

                            return (
                                <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-200 group">
                                    <div className="h-48 bg-stone-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
                                        {p.image_url ? (
                                            <img
                                                src={`http://localhost:5050${p.image_url}`}
                                                alt={p.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
                                                onError={(e) => { e.target.src = "https://via.placeholder.com/300?text=Kopi+Flojava"; }}
                                            />
                                        ) : (
                                            <span className="text-stone-300 font-bold text-xs uppercase tracking-widest">No Image</span>
                                        )}
                                        {!isAvailable && (
                                            <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                                                <span className="text-stone-700 font-bold text-xs uppercase tracking-widest border border-stone-700 rounded px-3 py-1 bg-white">
                                                    Stok Habis
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <h3 className="font-bold text-stone-800 text-lg mb-1 truncate">{p.name}</h3>
                                    <p className="text-orange-900 font-black text-lg mb-3">
                                        Rp {Number(p.price).toLocaleString('id-ID')}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handleBuyNow(p)}
                                            disabled={!isAvailable || isActionLoading}
                                            className="flex-1 bg-orange-900 text-white py-2 rounded-xl font-bold hover:bg-orange-800 transition disabled:bg-stone-300 disabled:cursor-not-allowed"
                                        >
                                            {isActionLoading ? '...' : 'Beli Sekarang'}
                                        </button>
                                        <button
                                            onClick={() => handleAddToCart(p)}
                                            disabled={!isAvailable || isActionLoading}
                                            aria-label="Tambah ke keranjang"
                                            className="w-11 h-11 shrink-0 flex items-center justify-center rounded-xl border-2 border-orange-900 text-orange-900 hover:bg-orange-50 transition disabled:border-stone-300 disabled:text-stone-300 disabled:cursor-not-allowed"
                                        >
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="9" cy="21" r="1" />
                                                <circle cx="20" cy="21" r="1" />
                                                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                            <p className="text-stone-400 font-medium">
                                {searchTerm
                                    ? `Produk "${searchTerm}" tidak ditemukan. ☕`
                                    : 'Belum ada produk tersedia.'}
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;
