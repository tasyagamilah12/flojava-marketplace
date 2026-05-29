import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ktp, setKtp] = useState(null);
  const [preview, setPreview] = useState(null);
  const [role, setRole] = useState('customer'); // Default Pembeli
  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setKtp(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('name', name);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    if (role === 'vendor') {
      if (!ktp) return alert("KTP wajib di-upload untuk Vendor!");
      formData.append('ktp_image', ktp);
    }

    try {
      // Arahkan semua ke endpoint yang mendukung multipart/form-data
      await api.post('/auth/register-vendor', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      navigate('/register-success', { state: { role: role } });
    } catch (err) {
      // Log error ke console agar kamu bisa lihat pesan asli dari server
      console.error("Detail Error:", err.response?.data);
      alert('Registrasi Gagal: ' + (err.response?.data?.message || 'Server Error'));
    }
  }; 

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-100 p-4">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border-t-8 border-orange-900">
        <h2 className="text-2xl font-bold text-center text-stone-800 mb-2">Daftar Akun Flojava</h2>
        <p className="text-center text-sm text-stone-500 mb-6">Pilih jenis akun kamu di bawah ini</p>

        <div className="flex gap-4 mb-6">
          <button
            type="button"
            onClick={() => { setRole('customer'); setPreview(null); setKtp(null); }}
            className={`flex-1 py-2 rounded-lg font-bold transition ${role === 'customer' ? 'bg-orange-900 text-white' : 'bg-stone-200 text-stone-600'}`}
          >
            Pembeli
          </button>
          <button
            type="button"
            onClick={() => setRole('vendor')}
            className={`flex-1 py-2 rounded-lg font-bold transition ${role === 'vendor' ? 'bg-orange-900 text-white' : 'bg-stone-200 text-stone-600'}`}
          >
            Penjual
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">Nama Lengkap</label>
            <input type="text" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-900"
              onChange={(e) => setName(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Email</label>
            <input type="email" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-900"
              onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input type="password" className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-orange-900"
              onChange={(e) => setPassword(e.target.value)} required />
          </div>

          {role === 'vendor' && (
            <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 transition-all">
              <label className="block text-sm font-bold text-orange-900 mb-2">Upload KTP (Wajib Vendor)</label>
              <input type="file" accept="image/*" className="text-sm w-full"
                onChange={handleFileChange} required />

              {preview && (
                <div className="mt-3">
                  <img src={preview} alt="KTP Preview" className="w-full h-32 object-cover rounded-md border border-orange-200 shadow-inner" />
                </div>
              )}
            </div>
          )}
        </div>

        <button className="w-full bg-orange-900 text-white py-3 rounded-lg font-bold hover:bg-orange-800 transition mt-6">
          {role === 'vendor' ? 'Daftar Jadi Penjual' : 'Daftar Jadi Pembeli'}
        </button>

        <p className="text-center text-sm text-stone-600 mt-4">
          Sudah punya akun? <Link to="/login" className="text-orange-800 font-bold underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;