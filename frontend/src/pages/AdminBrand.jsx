import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminBrand() {
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");
  const [newBrandLogo, setNewBrandLogo] = useState("");
  const [editingBrand, setEditingBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchBrands = () => {
    axios.get("http://localhost:8080/api/brands")
      .then(res => setBrands(res.data))
      .catch(err => console.error("Lỗi lấy thương hiệu:", err));
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleSubmit = async (e) => {
    if(e) e.preventDefault(); 
    
    if (!newBrandName.trim()) {
      alert("Vui lòng nhập tên thương hiệu!");
      return;
    }

    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = { name: newBrandName, logoUrl: newBrandLogo };

      if (editingBrand) {
        await axios.put(`http://localhost:8080/api/brands/${editingBrand.id}`, data, config);
        alert("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:8080/api/brands", data, config);
        alert("Thêm thương hiệu mới thành công!");
      }

      setEditingBrand(null);
      setNewBrandName("");
      setNewBrandLogo("");
      fetchBrands();
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác: " + (err.response?.data?.message || "Kiểm tra quyền Admin hoặc kết nối Server"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setNewBrandName(brand.name);
    setNewBrandLogo(brand.logoUrl || "");
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa thương hiệu này?")) {
      axios.delete(`http://localhost:8080/api/brands/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert("Đã xóa thương hiệu.");
        fetchBrands();
      })
      .catch(err => alert("Không thể xóa: Thương hiệu này có thể đang được sử dụng!"));
    }
  };

  return (
    <div className="p-8 animate-fadeIn font-sans">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Thương hiệu</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Quản lý các hãng điện thoại</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all focus-within:shadow-xl focus-within:shadow-blue-100/50">
        <div className="flex gap-4">
            <input 
            value={newBrandName} 
            onChange={e => setNewBrandName(e.target.value)}
            placeholder="Tên thương hiệu (VD: Apple, Samsung...)" 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
            <input 
            value={newBrandLogo} 
            onChange={e => setNewBrandLogo(e.target.value)}
            placeholder="Link ảnh Logo (Tùy chọn)" 
            className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
        </div>
        <div className="flex gap-4 mt-2">
            <button 
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
            >
            {isLoading ? "Đang lưu..." : editingBrand ? "Cập nhật" : "Thêm thương hiệu"}
            </button>
            
            {editingBrand && (
            <button 
                type="button"
                onClick={() => {setEditingBrand(null); setNewBrandName(""); setNewBrandLogo("");}} 
                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-colors"
            >
                Hủy
            </button>
            )}
        </div>
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {brands.length > 0 ? brands.map(brand => (
          <div key={brand.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center group hover:shadow-2xl hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100">
            <div className="flex items-center gap-4">
               {brand.logoUrl ? (
                   <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain" />
               ) : (
                   <span className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold">Logo</span>
               )}
               <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{brand.name}</span>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => handleEdit(brand)} 
                className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(brand.id)} 
                className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Chưa có thương hiệu nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
}
