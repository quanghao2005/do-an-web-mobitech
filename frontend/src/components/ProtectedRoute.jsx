import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
    const role = localStorage.getItem('role');
    const token = localStorage.getItem('token');

    // Nếu không có token hoặc role không phải ADMIN, đá về trang chủ
    if (!token || role !== 'ADMIN') {
        alert("Bạn không có quyền truy cập khu vực này!");
        return <Navigate to="/" replace />;
    }

    return children;
}