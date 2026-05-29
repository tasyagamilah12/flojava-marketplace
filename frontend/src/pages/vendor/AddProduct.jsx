import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

const AddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('price', price);
    formData.append('stock', stock);
    formData.append('description', description);
    formData.append('product_image', image);

    try {
      await api.post('/products/add-product', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Produk berhasil ditambahkan! ☕");
      navigate('/vendor/dashboard');
    } catch (err) {
      alert("Gagal menambah produk: " + (err.response?.data?.message || "Server Error"));
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 p-8 flex justify-center">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-2xl border-t-8 border-orange-900">
        <h2 className="text-2xl font-bold text-stone-800 mb-6 text-center">Tambah Produk Kopi Baru</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Nama Produk</label>
              <input type="text" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-900" 
                onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Harga (Rp)</label>
              <input type="number" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-900" 
                onChange={(e) => setPrice(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Stok Awal</label>
              <input type="number" className="w-full p-3 border rounded-xl outline-none focus:ring-2 focus:ring-orange-900" 
                onChange={(e) => setStock(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1">Deskripsi Produk</label>
              <textarea className="w-full p-3 border rounded-xl h-32 outline-none focus:ring-2 focus:ring-orange-900" 
                onChange={(e) => setDescription(e.target.value)} required placeholder="Ceritakan keunikan rasa kopi ini..."></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold mb-1">Foto Produk</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} required 
                className="text-sm text-stone-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-900 hover:file:bg-orange-100" />
            </div>
          </div>
        </div>

        <button className="w-full bg-orange-900 text-white py-4 rounded-2xl font-bold mt-8 hover:bg-orange-800 transition shadow-lg">
          Simpan Produk ke Toko
        </button>
      </form>
    </div>
  );
};

export default AddProduct;