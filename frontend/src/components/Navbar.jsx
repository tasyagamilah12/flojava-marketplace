// frontend/src/components/Navbar.jsx — VERSI LENGKAP, timpa file lama.
//
// Perubahan:
//   1. Search box atas disambungkan ke SearchContext (sebelumnya cuma
//      <input> kosong tanpa onChange/state — itu sebabnya "tidak berfungsi
//      dengan baik" seperti yang kamu laporkan)
//   2. Menu "Riwayat Pembelian" untuk customer TIDAK diubah — kodenya
//      sebenarnya sudah benar (navigate('/orders')), bug-nya ada di
//      App.jsx yang belum mendaftarkan route /orders. Lihat App.jsx baru.

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const { searchTerm, setSearchTerm } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();

  const isNotHome = location.pathname !== '/';

  return (
    <>
      {/* --- NAVBAR UTAMA --- */}
      <nav className="bg-orange-900 text-white p-4 flex justify-between items-center sticky top-0 z-50 shadow-md">
        <div className="flex items-center gap-4">
          {isNotHome && (
            <button onClick={() => navigate(-1)} className="hover:bg-orange-800 p-2 rounded-full transition">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
          )}
          <button onClick={() => setIsOpen(true)} className="p-2 hover:bg-orange-800 rounded-lg transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="font-bold text-xl hidden md:block">Flojava</h1>
        </div>

        {/* Kolom Pencarian — sekarang benar-benar berfungsi via SearchContext */}
        <div className="flex-1 max-w-md mx-4">
          <input
            type="text"
            placeholder="Cari kopi, rempah..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              if (location.pathname !== '/') navigate('/'); // arahkan ke Home saat mulai mencari
            }}
            className="w-full px-4 py-2 rounded-full text-black text-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        {/* Tombol Keranjang */}
        <button
          onClick={() => navigate('/cart')}
          className="relative p-2 mr-2 hover:bg-orange-800 rounded-full transition"
          aria-label="Keranjang belanja"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm hidden sm:block">Halo, {user?.name || 'User'}</span>
          <div className="w-8 h-8 bg-orange-200 rounded-full flex items-center justify-center text-orange-900 font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
        </div>
      </nav>

      {/* --- SIDEBAR OVERLAY (HAMBURGER MENU) --- */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] flex">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsOpen(false)}></div>

          <div className="relative w-72 bg-white h-full shadow-2xl p-6 flex flex-col transition-all duration-300">
            <div className="flex items-center gap-4 mb-8 p-2 border-b">
              <div className="w-12 h-12 bg-orange-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div>
                <p className="font-bold text-stone-800 truncate w-40">{user?.name}</p>
                <p className="text-xs text-stone-500 truncate w-40">{user?.email}</p>
              </div>
            </div>

            <nav className="flex-1 space-y-2">
              <button
                onClick={() => { navigate('/profile'); setIsOpen(false); }}
                className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
              >
                <span className="text-xl">👤</span> Data Saya
              </button>

              {user?.role === 'customer' && (
                <>
                  <button
                    onClick={() => { navigate('/cart'); setIsOpen(false); }}
                    className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                  >
                    <span className="text-xl">🛒</span> Keranjang Saya
                  </button>
                  <button
                    onClick={() => { navigate('/orders'); setIsOpen(false); }}
                    className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                  >
                    <span className="text-xl">🛍️</span> Riwayat Pembelian
                  </button>
                </>
              )}

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

              {user?.role === 'admin' && (
                <button
                  onClick={() => { navigate('/admin/dashboard'); setIsOpen(false); }}
                  className="w-full text-left p-3 hover:bg-stone-100 rounded-xl flex items-center gap-3 font-medium text-stone-700"
                >
                  <span className="text-xl">🛡️</span> Panel Admin
                </button>
              )}
            </nav>

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
