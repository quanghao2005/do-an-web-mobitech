import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminBanner() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Cấu hình headers cho axios
  const config = {
    headers: { Authorization: `Bearer ${token}` }
  };

  // 1. Tải danh sách Banner từ Database
  const fetchBanners = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/banners");
      setBanners(res.data);
    } catch (err) {
      console.error("Lỗi tải banner:", err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. Xử lý Thay đổi ảnh (Cập nhật)
  const handleUpdateImage = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert("Ảnh phải dưới 2MB");
      
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          setLoading(true);
          // Gọi API cập nhật ảnh vào DB
          await axios.put(`http://localhost:8080/api/banners/${id}`, { url: base64String }, config);
          fetchBanners(); // Tải lại danh sách mới
          alert("Đã cập nhật ảnh banner!");
        } catch (err) {
          alert("Lỗi khi cập nhật ảnh!");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 3. Xử lý Thêm Banner mới
  const handleAddBanner = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result;
        try {
          setLoading(true);
          // Gửi dữ liệu lên Backend để lưu vào MySQL
          await axios.post("http://localhost:8080/api/banners", {
            url: base64String,
            title: "Banner mới vừa thêm"
          }, config);
          fetchBanners();
          alert("Đã thêm banner mới!");
        } catch (err) {
          alert("Lỗi khi thêm banner!");
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // 4. Xử lý Xóa Banner
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa banner này vĩnh viễn?")) {
      try {
        await axios.delete(`http://localhost:8080/api/banners/${id}`, config);
        setBanners(banners.filter(b => b.id !== id));
        alert("Đã xóa banner.");
      } catch (err) {
        alert("Lỗi khi xóa!");
      }
    }
  };

  // 5. Sửa tiêu đề Banner
  const handleEditTitle = async (id, oldTitle) => {
  const newTitle = window.prompt("Nhập tiêu đề mới cho banner:", oldTitle);
  
  // Kiểm tra nếu người dùng nhấn Cancel hoặc không nhập gì thì dừng
  if (newTitle === null || newTitle === oldTitle) return;

  try {
    // Tìm banner hiện tại trong state để lấy lại cái URL ảnh cũ
    const currentBanner = banners.find(b => b.id === id);

    // GỬI CẢ TIÊU ĐỀ MỚI VÀ URL CŨ (Để không bị mất ảnh)
    await axios.put(`http://localhost:8080/api/banners/${id}`, { 
      title: newTitle,
      url: currentBanner.url // Giữ lại ảnh hiện tại
    }, config);

    fetchBanners(); // Tải lại danh sách để cập nhật giao diện
    alert("Cập nhật tiêu đề thành công!");
  } catch (err) {
    alert("Lỗi cập nhật: " + err.message);
  }
};

  return (
    <div className="p-8 animate-fadeIn relative">
      {/* Hiệu ứng loading khi đang upload ảnh nặng */}
      {loading && (
        <div className="fixed inset-0 bg-white/50 z-50 flex items-center justify-center backdrop-blur-sm">
           <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="mb-10">
        <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Quản lý Banner</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Giao diện quảng cáo hệ thống</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {banners.map(b => (
          <div key={b.id} className="bg-white p-5 rounded-[3rem] shadow-sm border border-slate-50 relative group hover:shadow-xl transition-all duration-500">
            <div className="relative overflow-hidden rounded-[2rem] h-52 bg-slate-100 shadow-inner">
              <img src={b.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
              
              <button 
                onClick={() => handleDelete(b.id)}
                className="absolute top-4 right-4 w-10 h-10 bg-white/80 backdrop-blur-md text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white flex items-center justify-center font-bold shadow-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 flex justify-between items-center px-2">
              <div className="cursor-pointer group/title" onClick={() => handleEditTitle(b.id, b.title)}>
                <span className="font-black text-slate-800 uppercase text-sm tracking-tight group-hover/title:text-blue-600 transition-colors">
                  {b.title} <span className="opacity-0 group-hover/title:opacity-100 ml-1">✏️</span>
                </span>
              </div>
              
              <label className="bg-blue-50 text-blue-600 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-blue-600 hover:text-white transition-all shadow-sm active:scale-95">
                Thay ảnh
                <input 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={(e) => handleUpdateImage(b.id, e)} 
                />
              </label>
            </div>
          </div>
        ))}

        {/* NÚT THÊM BANNER MỚI */}
        <label className="border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center h-[310px] hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer group active:scale-[0.98]">
          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors shadow-sm">
             <span className="text-3xl text-slate-300 group-hover:text-blue-500">+</span>
          </div>
          <span className="text-slate-400 group-hover:text-blue-600 font-black text-[11px] uppercase tracking-[0.2em]">Thêm Banner mới</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleAddBanner} />
        </label>
      </div>
      
      {banners.length === 0 && !loading && (
        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[3rem] mt-4">
           <p className="text-slate-300 font-black uppercase text-xs tracking-widest italic">Hiện không có dữ liệu banner trong Database</p>
        </div>
      )}
    </div>
  );
}