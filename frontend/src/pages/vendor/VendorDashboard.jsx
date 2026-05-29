import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const VendorDashboard = () => {
    const { user, logout } = useAuth(); // Ambil data user & fungsi logout
    const [stats, setStats] = useState({ totalProducts: 0, products: [] });
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Jika vendor masih pending, paksa ke halaman pending
        if (user?.role === 'vendor' && user?.status === 'pending') {
            navigate('/vendor/pending');
        }
    }, [user, navigate]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const res = await api.get('/vendor/dashboard-stats');
                setStats(res.data);
            } catch (err) {
                console.error("Gagal memuat data", err);
                if (err.response?.status === 401) navigate('/login');
            } finally {
                setLoading(false); // Matikan spinner apapun yang terjadi
            }
        };
        fetchDashboardData();
    }, [navigate]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-stone-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-orange-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-100 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-orange-900 text-white p-6 hidden md:block">
                <h2 className="text-2xl font-bold mb-8">Flojava Vendor</h2>
                <nav className="space-y-4">
                    <button className="block w-full text-left font-bold py-2 px-4 bg-orange-800 rounded-lg">Dashboard</button>
                    <button onClick={() => navigate('/vendor/add-product')} className="block w-full text-left py-2 px-4 hover:bg-orange-800 rounded-lg transition">Tambah Produk</button>
                    <button onClick={() => { logout(); navigate('/login'); }} className="block w-full text-left py-2 px-4 mt-10 text-orange-300 hover:text-white">Keluar</button>
                </nav>
            </aside>

            {/* Content */}
            <main className="flex-1 p-8">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-stone-800">Halo, {user?.name}! 👋</h1>
                        <p className="text-stone-500 text-sm">Status Toko: <span className="font-bold text-green-600 uppercase">{user?.status}</span></p>
                    </div>
                    <button onClick={() => navigate('/vendor/add-product')} className="bg-orange-900 text-white px-6 py-2 rounded-xl font-bold">+ Produk Baru</button>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border-b-4 border-orange-900">
                        <p className="text-stone-500 text-xs font-bold uppercase">Total Produk</p>
                        <h3 className="text-3xl font-bold text-stone-800">{stats.totalProducts}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-stone-200">
                    <div className="p-6 border-b"><h2 className="text-xl font-bold">Produk Saya</h2></div>
                    <table className="w-full text-left">
                        <thead className="bg-stone-50 text-stone-500 text-sm">
                            <tr>
                                <th className="p-4">Nama Kopi</th>
                                <th className="p-4">Harga</th>
                                <th className="p-4">Stok</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stats.products?.length > 0 ? (
                                stats.products.map((p) => (
                                    <tr key={p.id} className="border-b hover:bg-stone-50">
                                        <td className="p-4 font-semibold">{p.name}</td>
                                        <td className="p-4">Rp {Number(p.price).toLocaleString('id-ID')}</td>
                                        <td className="p-4">{p.stock} pcs</td>
                                    </tr>
                                ))
                            ) : (
                                <tr><td colSpan="3" className="p-10 text-center text-stone-400 italic">Belum ada produk.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default VendorDashboard;