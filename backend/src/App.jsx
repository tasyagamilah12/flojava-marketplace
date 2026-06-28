// frontend/src/App.jsx — VERSI LENGKAP, timpa file lama.
//
// Perubahan: tambah route /cart dan /orders di dalam blok ProtectedRoute
// khusus customer. INI YANG MEMPERBAIKI bug "klik Riwayat Pembelian malah
// ke login" — Navbar.jsx sebenarnya sudah benar manggil navigate('/orders'),
// tapi route /orders memang belum pernah didaftarkan di sini, jadi selalu
// jatuh ke catch-all "*" yang redirect ke /login.

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import VendorDashboard from "./pages/vendor/VendorDashboard.jsx";
import VendorPending from "./pages/vendor/VendorPending.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RegisterSuccess from './pages/auth/RegisterSuccess.jsx';
import Home from "./pages/user/Home.jsx";
import AddProduct from './pages/vendor/AddProduct.jsx';
import Navbar from './components/Navbar';
import Profile from './pages/Profile';
import OrderList from './pages/vendor/OrderList.jsx';

// BARU
import Cart from './pages/user/Cart.jsx';
import OrderHistory from './pages/user/OrderHistory.jsx';

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 1. Rute Publik (TANPA NAVBAR) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrasi" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* --- 2. Rute Terproteksi (MENGGUNAKAN NAVBAR) --- */}
        <Route element={<><Navbar /><ProtectedRoute /></>}>

          {/* Rute Khusus ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Rute Khusus VENDOR */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/add-product" element={<AddProduct />} />
            <Route path="/vendor/orders" element={<OrderList />} />
          </Route>

          {/* Rute Khusus CUSTOMER */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />           {/* ← BARU */}
            <Route path="/orders" element={<OrderHistory />} /> {/* ← BARU, fix bug riwayat pembelian */}
          </Route>

          {/* Rute Bersama (Hanya butuh Login) */}
          <Route path="/profile" element={<Profile />} />
          <Route path="/vendor/pending" element={<VendorPending />} />
        </Route>

        {/* --- 3. Catch-all (Redirect ke Login) --- */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
