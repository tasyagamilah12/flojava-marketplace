import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const Home = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState(""); // State pencarian lokal
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Perbaikan: Gunakan backtick (`) dan pastikan endpoint benar
                const res = await api.get(`/products`);

                // Backend kamu mengirim { data: [...], pagination: {...} }
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

    // Logika pencarian di sisi frontend agar lebih cepat
    const filteredProducts = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (loading) return <div className="text-center py-20">Memuat kopi terbaik... ☕</div>;

    return (
        <div className="min-h-screen bg-stone-50">
            {/* ... bagian NAV tetap sama ... */}
            <nav className="bg-orange-900 p-4 text-white flex justify-between items-center px-10 shadow-lg sticky top-0 z-50">
                <h1 className="text-2xl font-bold tracking-tight">Flojava Marketplace</h1>

                <div className="relative w-full max-w-md mx-4">
                    <input
                        type="text"
                        placeholder="Cari kopi..."
                        className="w-full py-2 pl-10 pr-4 rounded-xl text-stone-800 outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {/* SVG Icon tetap sama */}
                </div>

                <div className="flex items-center space-x-6 text-sm font-medium">
                    <span>Halo, {user?.name || 'Pembeli'} 👋</span>
                    <button onClick={handleLogout} className="bg-orange-800 px-4 py-2 rounded-lg hover:bg-orange-700 transition">
                        Keluar
                    </button>
                </div>
            </nav>

            <main className="p-10 max-w-7xl mx-auto">
                <header className="mb-10">
                    <h2 className="text-4xl font-extrabold text-stone-800 mb-2">Koleksi Kopi & Rempah ☕</h2>
                    <p className="text-stone-500">Kualitas terbaik dari petani Nusantara.</p>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((p) => (
                            <div key={p.id} className="bg-white p-4 rounded-3xl shadow-sm hover:shadow-xl transition-all border border-stone-200 group">
                                <div className="h-48 bg-stone-100 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
                                    {/* Menampilkan Foto Asli dari Backend */}
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
                                </div>
                                <h3 className="font-bold text-stone-800 text-lg mb-1 truncate">{p.name}</h3>
                                <p className="text-orange-900 font-black text-lg">
                                    Rp {Number(p.price).toLocaleString('id-ID')}
                                </p>
                                <button className="w-full mt-4 bg-stone-800 text-white py-2 rounded-xl hover:bg-orange-900 transition">
                                    Tambah ke Keranjang
                                </button>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-20 bg-white rounded-3xl border-2 border-dashed border-stone-200">
                            <p className="text-stone-400 font-medium">Produk "{searchTerm}" tidak ditemukan. ☕</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Home;