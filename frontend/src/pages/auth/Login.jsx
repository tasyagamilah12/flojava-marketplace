import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // 1. Panggil API terlebih dahulu
      // Di dalam Login.jsx
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token); 
      
      // 2. Ambil data user dari respon server
      const userData = res.data.user; 
      const { role, status } = userData;

      // 3. Simpan data user ke dalam AuthContext
      login(userData);

      // 4. BARU KEMUDIAN arahkan berdasarkan role dan status
      if (role === 'admin') {
        navigate('/admin/dashboard');
      } else if (role === 'vendor') {
        if (status === 'pending') {
          navigate('/vendor/pending');
        } else {
          navigate('/vendor/dashboard'); // Vendor Chiko akan diarahkan ke sini
        }
      } else {
        navigate('/'); // Hanya pembeli (customer) yang masuk ke halaman utama
      }

    } catch (err) {
      console.error("Login Error:", err);
      alert(err.response?.data?.message || 'Login Gagal');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-orange-900">
        {/* JUDUL DINAMIS */}
        <h2 className="text-2xl font-bold text-center text-stone-800 mb-6">Masuk ke Flojava</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-900"
              onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input type="password" required className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-900"
              onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>

        <button className="w-full bg-orange-900 text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition mt-6">
          Masuk
        </button>

        <p className="text-center text-sm text-stone-600 mt-4">
          Belum punya akun?{' '}
          <Link
            to="/registrasi"
            className="text-orange-800 font-bold underline cursor-pointer hover:text-orange-700"
          >
            Daftar di sini
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;