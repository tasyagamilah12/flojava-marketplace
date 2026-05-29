import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const VendorPending = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-orange-900">
        {/* Ikon Jam Pasir / Menunggu */}
        <div className="w-20 h-20 bg-orange-100 text-orange-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <h1 className="text-2xl font-bold text-stone-800 mb-4">Akun Sedang Ditinjau ☕</h1>
        
        <div className="text-stone-600 mb-8 space-y-4 text-sm">
          <p>Halo **{user?.name}**, pendaftaran vendor kamu untuk **Flojava** sedang dalam tahap verifikasi oleh tim Admin.</p>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <p className="font-semibold text-orange-900 mb-1">Kenapa ini dilakukan?</p>
            <p className="text-xs">Kami memeriksa data KTP untuk memastikan keamanan transaksi bagi pembeli dan penjual di platform kami.</p>
          </div>
          <p>Proses ini biasanya memakan waktu maksimal **1x24 jam**. Kami akan memberikan akses penuh setelah verifikasi selesai.</p>
        </div>

        <button 
          onClick={handleLogout}
          className="w-full bg-stone-800 text-white py-3 rounded-xl font-bold hover:bg-stone-700 transition"
        >
          Keluar (Log Out)
        </button>
        
        <p className="mt-8 text-[10px] text-stone-400 font-bold uppercase tracking-widest">Powered by Valdisa Studio</p>
      </div>
    </div>
  );
};

export default VendorPending;