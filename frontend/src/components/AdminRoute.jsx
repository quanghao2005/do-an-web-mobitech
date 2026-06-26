import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
    const role = localStorage.getItem("role");
    
    if (role !== "ADMIN") {
        alert("Bạn không có quyền vào trang Quản trị!");
        return <Navigate to="/" />;
    }
    return children;
}