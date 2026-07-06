import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import toast from 'react-hot-toast'

// Ghi đè hàm alert mặc định của trình duyệt để dùng giao diện Toast hiện đại
window.alert = (message) => {
  const msgStr = String(message).toLowerCase();
  // Tự động nhận diện lỗi hoặc thành công dựa vào nội dung chữ
  if (msgStr.includes("lỗi") || msgStr.includes("thất bại") || msgStr.includes("vui lòng") || msgStr.includes("không thể") || msgStr.includes("quá lớn")) {
    toast.error(message, { duration: 2500 });
  } else if (msgStr.includes("thành công") || msgStr.includes("đã thêm") || msgStr.includes("đã xóa") || msgStr.includes("cập nhật")) {
    toast.success(message, { duration: 1500 });
  } else {
    // Các thông báo thông thường khác
    toast(message, { duration: 1500 });
  }
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
