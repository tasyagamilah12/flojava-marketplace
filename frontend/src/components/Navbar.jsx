import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isNotHome = location.pathname !== '/';

  return (
    <>
      {/* --- NAVBAR UTAMA --- */}
      <nav className="bg-orange-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          {/* Tombol Panah Kembali */}
          {isNotHome && (
            <button onClick={() => navigate(-1)} className="hover:bg-orange-800 p-2 rounded-full transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          {/* Tombol Hamburger */}
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-orange-800 rounded-lg transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-xl hidden md:block">Flojava</h1>
        </div>

        {/* Kolom Pencarian [cite: 89] */}
        <div className="flex-1 max-w-md mx-4">
          <input 
            type="text" 
            placeholder="Cari di Flojava..." 
            className="w-full px-4 py-2 rounded-full text-black text-sm outline-none focus:ring-2 focus:ring-orange-400" 
          />
        </div>

        {/* Profil Singkat di Pojok Kanan */}
        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:block">Halo, {user?.name || 'User'}</span>
          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-900 font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </nav>

      {/* --- SIDEBAR OVERLAY (HAMBURGER MENU) [cite: 89, 93] --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex">
          {/* Background Gelap */}
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>
          
          {/* Menu Sidebar */}
          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col transition-all duration-300">
            
            {/* Bagian Profil Singkat Sidebar  */}
            <div className="flex items-center gap-4 mb-8 p-2 border-b">
              <div className="w-12 h-12 bg-orange-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-stone-800 truncate w-40">{user?.name}</p>
                <p className="text-xs text-stone-500 truncate w-40">{user?.email}</p>
              </div>
            </div>

            {/* Menu Navigasi Berdasarkan Role [cite: 91, 93] */}
            <nav className="flex-1 space-y-2">
              {/* Berlaku untuk SEMUA Role */}
              <button 
                onClick={() => { navigate('/profile'); setIsOpen(false); }} 
                className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
              >
                <span className="text-xl">👤</span> Data Saya
              </button>

              {/* Menu Khusus Customer  */}
              {user?.role === 'customer' && (
                <button 
                  onClick={() => { navigate('/orders'); setIsOpen(false); }} 
                  className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                >
                  <span className="text-xl">🛍️</span> Riwayat Pembelian
                </button>
              )}

              {/* Menu Khusus Vendor [cite: 91, 92] */}
              {user?.role === 'vendor' && (
                <>
                  <button 
                    onClick={() => { navigate('/vendor/dashboard'); setIsOpen(false); }} 
                    className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                  >
                    <span className="text-xl">🏪</span> Dashboard Toko
                  </button>
                  <button 
                    onClick={() => { navigate('/vendor/orders'); setIsOpen(false); }} 
                    className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                  >
                    <span className="text-xl">📦</span> Pesanan Masuk
                  </button>
                </>
              )}

              {/* Menu Khusus Admin [cite: 93] */}
              {user?.role === 'admin' && (
                <button 
                  onClick={() => { navigate('/admin/dashboard'); setIsOpen(false); }} 
                  className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                >
                  <span className="text-xl">🛡️</span> Panel Admin
                </button>
              )}
            </nav>

            {/* Tombol Logout  */}
            <button 
              onClick={() => { logout(); setIsOpen(false); }} 
              className="p-3 text-red-600 font-bold hover:bg-red-50 rounded-lg flex items-center gap-3 mt-auto transition"
            >
              <span>🚪</span> Keluar
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;