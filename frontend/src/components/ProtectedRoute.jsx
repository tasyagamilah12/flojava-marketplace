import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth(); // Ambil loading dari Context
  const location = useLocation();

  // 1. TUNGGU SESI PULIH (Penting agar tidak terlempar saat refresh)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-100">
        <p className="text-orange-900 font-bold animate-pulse">Memulihkan sesi Flojava... ☕</p>
      </div>
    );
  }

  // 2. Jika benar-benar tidak ada user setelah loading selesai
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Khusus Vendor yang masih Pending
  if (
    user.role === "vendor" &&
    user.status === "pending" &&
    location.pathname !== "/vendor/pending"
  ) {
    return <Navigate to="/vendor/pending" replace />;
  }

  // 4. Proteksi Role (Admin/Vendor/Customer)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Jika role tidak diizinkan, kembalikan ke Home atau halaman yang sesuai
    return <Navigate to="/" replace />;
  }

  // Jika semua pengecekan lolos, tampilkan halaman tujuan
  return <Outlet />;
};

export default ProtectedRoute;