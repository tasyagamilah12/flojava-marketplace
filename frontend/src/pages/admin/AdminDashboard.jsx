import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [tab, setTab] = useState('vendors'); // 'vendors' atau 'products'
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // 1. Ambil Data (Vendor & Produk Pending)
  const fetchData = async () => {
    try {
      const vendorRes = await api.get('/admin/pending-vendors');
      const productRes = await api.get('/admin/products/pending');
      setVendors(vendorRes.data);
      setProducts(productRes.data);
    } catch (err) {
      console.error("Gagal memuat data", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 2. Aksi Verifikasi Vendor
  const handleVendorAction = async (id, status) => {
    if (!window.confirm(`Yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} vendor ini?`)) return;
    try {
      await api.put(`/admin/verify-vendor/${id}`, { status });
      alert(`Vendor berhasil ${status}`);
      fetchData();
    } catch (err) {
      alert("Gagal memproses verifikasi vendor");
    }
  };

  // 3. Aksi Verifikasi Produk
  const handleProductAction = async (id, status) => {
    if (!window.confirm(`Yakin ingin ${status === 'approved' ? 'menyetujui' : 'menolak'} produk ini?`)) return;
    try {
      // Pastikan endpoint ini sesuai dengan backend (misal: /admin/products/approve/:id)
      await api.put(`/admin/products/approve/${id}`, { status });
      alert(`Produk berhasil ${status}`);
      fetchData();
    } catch (err) {
      alert("Gagal memproses verifikasi produk");
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-stone-100">
      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-orange-900 text-white p-6 flex flex-col shadow-xl fixed h-full">
        <h1 className="text-2xl font-bold mb-10 text-center tracking-widest">FLOJAVA ADMIN</h1>
        
        <nav className="flex-1 space-y-3">
          <button 
            onClick={() => setTab('vendors')} 
            className={`w-full text-left p-4 rounded-xl font-bold transition ${tab === 'vendors' ? 'bg-orange-800 shadow-inner' : 'hover:bg-orange-800/50'}`}
          >
            👥 Verifikasi Vendor
          </button>
          <button 
            onClick={() => setTab('products')} 
            className={`w-full text-left p-4 rounded-xl font-bold transition ${tab === 'products' ? 'bg-orange-800 shadow-inner' : 'hover:bg-orange-800/50'}`}
          >
            📦 Verifikasi Produk
          </button>
        </nav>

        <button 
          onClick={handleLogout} 
          className="mt-auto p-4 bg-orange-950 rounded-xl font-bold text-orange-200 hover:text-white transition hover:bg-red-900"
        >
          🚪 Keluar (Logout)
        </button>
      </div>

      {/* --- KONTEN UTAMA --- */}
      <div className="flex-1 ml-64 p-10">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h2 className="text-3xl font-black text-stone-800 uppercase tracking-tight">
              {tab === 'vendors' ? 'Antrean Verifikasi Vendor' : 'Antrean Verifikasi Produk'}
            </h2>
            <p className="text-stone-500 font-medium">Panel kontrol kualitas marketplace Flojava</p>
          </div>
          <div className="bg-white px-6 py-2 rounded-2xl shadow-sm font-bold text-orange-900 border-b-4 border-orange-900">
            {tab === 'vendors' ? vendors.length : products.length} Menunggu
          </div>
        </header>

        {/* --- TAB VERIFIKASI VENDOR --- */}
        {tab === 'vendors' && (
          <div className="grid gap-4">
            {vendors.map((vendor) => (
              <div key={vendor.id} className="bg-white p-6 rounded-2xl shadow-sm flex items-center justify-between border-l-8 border-orange-700">
                <div>
                  <h3 className="font-bold text-xl text-stone-800">{vendor.name}</h3>
                  <p className="text-stone-500">{vendor.email}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setSelectedImage(`http://localhost:5050/uploads/ktp/${vendor.ktp_image}`)} className="px-4 py-2 text-stone-600 font-bold hover:underline">Lihat KTP</button>
                  <button onClick={() => handleVendorAction(vendor.id, 'approved')} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold">Setujui</button>
                  <button onClick={() => handleVendorAction(vendor.id, 'rejected')} className="bg-red-100 text-red-600 px-6 py-2 rounded-lg font-bold">Tolak</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* --- TAB VERIFIKASI PRODUK --- */}
        {tab === 'products' && (
          <div className="bg-white rounded-3xl shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 text-stone-500 uppercase text-xs font-black">
                <tr>
                  <th className="p-6">Produk</th>
                  <th className="p-6">Vendor</th>
                  <th className="p-6">Harga</th>
                  <th className="p-6 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-stone-50/50">
                    <td className="p-6 flex items-center gap-4">
                      <img 
                        src={`http://localhost:5050${prod.image_url}`} 
                        className="w-16 h-16 rounded-xl object-cover cursor-zoom-in" 
                        alt="kopi"
                        onClick={() => setSelectedImage(`http://localhost:5050${prod.image_url}`)}
                      />
                      <span className="font-bold text-stone-800">{prod.name}</span>
                    </td>
                    <td className="p-6 text-stone-600">{prod.vendor_name}</td>
                    <td className="p-6 font-bold text-orange-900">Rp {Number(prod.price).toLocaleString()}</td>
                    <td className="p-6">
                      <div className="flex justify-center gap-2">
                        <button onClick={() => handleProductAction(prod.id, 'approved')} className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold">Setujui</button>
                        <button onClick={() => handleProductAction(prod.id, 'rejected')} className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-bold">Tolak</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(tab === 'vendors' ? vendors.length : products.length) === 0 && (
          <div className="text-center py-20 bg-stone-200/50 rounded-3xl border-4 border-dashed border-stone-300">
            <p className="text-stone-400 font-bold text-xl">Semua antrean bersih! ☕</p>
          </div>
        )}
      </div>

      {/* MODAL PREVIEW (Bisa untuk KTP atau Produk) */}
      {selectedImage && (
        <div className="fixed inset-0 bg-stone-900/90 backdrop-blur-md flex items-center justify-center p-4 z-50" onClick={() => setSelectedImage(null)}>
          <div className="bg-white rounded-3xl overflow-hidden max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>
            <img src={selectedImage} alt="Preview" className="w-full max-h-[80vh] object-contain bg-stone-100" />
            <div className="p-6 flex justify-between items-center">
              <p className="text-stone-500 text-sm italic">Klik di luar gambar untuk menutup</p>
              <button onClick={() => setSelectedImage(null)} className="bg-orange-900 text-white px-8 py-2 rounded-xl font-bold">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;