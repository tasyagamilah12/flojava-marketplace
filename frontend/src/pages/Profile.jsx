import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Profile = () => {
  const { user, login } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/update-profile', formData);
      // Update data di context & localStorage agar sinkron
      login({ ...user, ...formData }); 
      setIsEditing(false);
      alert("Perubahan disimpan!");
    } catch (err) {
      alert("Gagal mengubah data");
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border-t-8 border-orange-900">
        <div className="bg-orange-50 p-8 text-center border-b">
          <div className="w-24 h-24 bg-orange-900 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            {user?.name?.charAt(0)}
          </div>
          <h2 className="text-2xl font-bold text-stone-800">{user?.name}</h2>
          <p className="text-orange-900 font-medium uppercase tracking-widest text-sm">{user?.role}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">Email (Tetap)</label>
              <input type="text" value={user?.email} disabled className="w-full p-3 bg-stone-100 rounded-xl text-stone-500 cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">Nama Lengkap</label>
              <input type="text" disabled={!isEditing} value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                className={`w-full p-3 border rounded-xl outline-none ${isEditing ? 'border-orange-900 ring-2 ring-orange-100' : 'bg-stone-50'}`} />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-600 mb-2">No. Telepon / WhatsApp</label>
              <input type="text" disabled={!isEditing} placeholder="Contoh: 08123456789" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className={`w-full p-3 border rounded-xl outline-none ${isEditing ? 'border-orange-900 ring-2 ring-orange-100' : 'bg-stone-50'}`} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-600 mb-2">Alamat Lengkap Pengiriman</label>
            <textarea disabled={!isEditing} rows="3" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})}
              className={`w-full p-3 border rounded-xl outline-none ${isEditing ? 'border-orange-900 ring-2 ring-orange-100' : 'bg-stone-50'}`}
              placeholder="Jalan, No Rumah, Kec, Kota, Kode Pos..."></textarea>
          </div>

          <div className="flex gap-4 mt-8">
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className="flex-1 bg-stone-800 text-white py-3 rounded-xl font-bold hover:bg-stone-700 transition">
                Ubah Data Saya
              </button>
            ) : (
              <>
                <button type="submit" className="flex-1 bg-orange-900 text-white py-3 rounded-xl font-bold hover:bg-orange-800 transition">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setIsEditing(false)} className="flex-1 bg-stone-200 text-stone-700 py-3 rounded-xl font-bold hover:bg-stone-300 transition">
                  Batal
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile;