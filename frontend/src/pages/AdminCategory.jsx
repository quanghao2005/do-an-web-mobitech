import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCategory() {
  const [categories, setCategories] = useState([]);
  const [newCat, setNewCat] = useState("");
  const [editingCat, setEditingCat] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái chờ API

  const token = localStorage.getItem("token"); // Lấy token để xác thực quyền Admin

  const fetchCats = () => {
    axios.get("http://localhost:8080/api/categories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  };

  useEffect(() => { fetchCats(); }, []);

  // XỬ LÝ LỖI NÚT KHÔNG BẤM ĐƯỢC
  const handleSubmit = async (e) => {
    // Ngăn chặn hành vi mặc định nếu bạn bọc trong thẻ <form>
    if(e) e.preventDefault(); 
    
    if (!newCat.trim()) {
      alert("Vui lòng nhập tên danh mục!");
      return;
    }

    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = { name: newCat };

      if (editingCat) {
        // CẬP NHẬT
        await axios.put(`http://localhost:8080/api/categories/${editingCat.id}`, data, config);
        alert("Cập nhật thành công!");
      } else {
        // THÊM MỚI
        await axios.post("http://localhost:8080/api/categories", data, config);
        alert("Thêm danh mục mới thành công!");
      }

      // Reset state sau khi thành công
      setEditingCat(null);
      setNewCat("");
      fetchCats();
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác: " + (err.response?.data?.message || "Kiểm tra quyền Admin hoặc kết nối Server"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (cat) => {
    setEditingCat(cat);
    setNewCat(cat.name);
    // Cuộn lên đầu trang để người dùng thấy ô nhập
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa danh mục này? Các sản phẩm thuộc danh mục này có thể bị ảnh hưởng!")) {
      axios.delete(`http://localhost:8080/api/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert("Đã xóa danh mục.");
        fetchCats();
      })
      .catch(err => alert("Không thể xóa: Danh mục này có thể đang chứa sản phẩm!"));
    }
  };

  return (
    <div className="p-8 animate-fadeIn font-sans">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Danh mục sản phẩm</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Quản lý thương hiệu & Phân loại</p>
      </div>
      
      {/* Ô NHẬP LIỆU - Dùng form để có thể nhấn Enter để gửi */}
      <form onSubmit={handleSubmit} className="flex gap-4 mb-12 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all focus-within:shadow-xl focus-within:shadow-blue-100/50">
        <input 
          value={newCat} 
          onChange={e => setNewCat(e.target.value)}
          placeholder={editingCat ? "Nhập tên danh mục mới..." : "Ví dụ: iPhone, Samsung, Oppo..."} 
          className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className={`bg-blue-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
        >
          {isLoading ? "Đang lưu..." : editingCat ? "Cập nhật ngay" : "Thêm danh mục"}
        </button>
        
        {editingCat && (
          <button 
            type="button"
            onClick={() => {setEditingCat(null); setNewCat("");}} 
            className="px-4 text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-colors"
          >
            Hủy
          </button>
        )}
      </form>

      {/* DANH SÁCH HIỂN THỊ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.length > 0 ? categories.map(cat => (
          <div key={cat.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center group hover:shadow-2xl hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100">
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
               <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{cat.name}</span>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => handleEdit(cat)} 
                className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                title="Sửa tên"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(cat.id)} 
                className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
                title="Xóa danh mục"
              >
                ✕
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Chưa có danh mục nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
}