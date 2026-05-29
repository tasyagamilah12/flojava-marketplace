import { Link, useLocation } from 'react-router-dom';

const RegisterSuccess = () => {
  const location = useLocation();
  const isVendor = location.state?.role === 'vendor';

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl shadow-2xl max-w-md w-full text-center border-t-8 border-orange-900">
        {/* Ikon Sukses Animatif */}
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-stone-800 mb-4">Hore! Berhasil 🎉</h1>
        
        <div className="text-stone-600 mb-8 space-y-3">
          {isVendor ? (
            <>
              <p>Pendaftaran vendor **Flojava** kamu telah diterima.</p>
              <p className="bg-orange-50 p-3 rounded-lg text-orange-800 text-sm border border-orange-100 font-medium">
                Admin kami akan memverifikasi KTP kamu dalam waktu maksimal 24 jam. Kami akan kabari via email!
              </p>
            </>
          ) : (
            <p>Akun pembeli kamu sudah aktif. Sekarang kamu bisa mulai berburu kopi dan rempah terbaik Nusantara.</p>
          )}
        </div>

        <Link 
          to="/login" 
          className="block w-full bg-orange-900 text-white py-3 rounded-xl font-bold hover:bg-orange-800 transition transform hover:scale-105 shadow-lg"
        >
          Masuk Sekarang
        </Link>
        
        <p className="mt-6 text-xs text-stone-400">© 2026 Valdisa Studio for Flojava Marketplace</p>
      </div>
    </div>
  );
};

export default RegisterSuccess;