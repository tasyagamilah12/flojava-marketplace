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

// 1. TAMBAHKAN IMPORT INI (Penyebab Crash)
import OrderList from './pages/vendor/OrderList.jsx'; 

function App() {
  return (
    <Router>
      <Routes>
        {/* --- 1. Rute Publik (TANPA NAVBAR) --- */}
        <Route path="/login" element={<Login />} />
        <Route path="/registrasi" element={<Register />} />
        <Route path="/register-success" element={<RegisterSuccess />} />

        {/* --- 2. Rute Terproteksi (MENGGUNAKAN NAVBAR) --- */}
        {/* Kita membungkus rute yang butuh Navbar di dalam satu elemen Fragment atau Route */}
        <Route element={<><Navbar /><ProtectedRoute /></>}>
          
          {/* Rute Khusus ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Route>

          {/* Rute Khusus VENDOR */}
          <Route element={<ProtectedRoute allowedRoles={['vendor']} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor/add-product" element={<AddProduct />} />
            <Route path="/vendor/orders" element={<OrderList />} /> {/* Rute Pesanan */}
          </Route>

          {/* Rute Khusus CUSTOMER */}
          <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
            <Route path="/" element={<Home />} />
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