import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminCustomer() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const token = localStorage.getItem("token");

  const fetchCustomers = () => {
    axios.get("http://localhost:8080/api/users", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCustomers(res.data.filter(u => u.role === 'USER')))
    .catch(err => console.error("Lỗi lấy danh sách khách hàng:", err));
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa khách hàng này?")) {
      axios.delete(`http://localhost:8080/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert("Đã xóa khách hàng thành công.");
        fetchCustomers();
      })
      .catch(err => alert("Lỗi khi xóa: " + err.message));
    }
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:8080/api/users/${editingUser.id}`, editingUser, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(() => {
      alert("Cập nhật thông tin thành công!");
      setEditingUser(null);
      fetchCustomers();
    })
    .catch(err => alert("Lỗi cập nhật: " + err.message));
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.phone && c.phone.includes(searchTerm))
  );

  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-800">Quản lý khách hàng</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
            Tổng cộng: {filteredCustomers.length} người dùng
          </p>
        </div>
        
        <div className="relative">
          <input 
            type="text" 
            placeholder="Tìm tên, số điện thoại..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white border-none rounded-2xl py-3 px-6 pl-12 shadow-sm text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 w-80"
          />
          <span className="absolute left-4 top-3.5">🔍</span>
        </div>
      </div>

      <div className="bg-white rounded-[3rem] shadow-sm overflow-hidden border border-slate-50">
        <table className="w-full text-left">
          <thead className="bg-slate-50/50 text-[10px] font-black uppercase text-slate-400 tracking-widest border-b border-slate-50">
            <tr>
              <th className="p-6">Khách hàng</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
              <th>Ngày tham gia</th>
              <th className="text-right p-6">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredCustomers.map(c => (
              <tr key={c.id} className="hover:bg-slate-50/30 transition-all group">
                <td className="p-6">
                  <div className="flex items-center gap-4">
                    <img 
                      src={c.avatar || "/images/default-avatar.png"} 
                      className="w-12 h-12 rounded-2xl object-cover shadow-sm border-2 border-white" 
                      alt="" 
                    />
                    <div>
                      <p className="font-black text-slate-800 text-sm uppercase">{c.fullName}</p>
                      
                      {/* --- PHẦN HOVER HIỆN ID VÀ MẬT KHẨU --- */}
                      <div className="relative group/info cursor-help inline-block">
                        <p className="text-[10px] text-slate-400 font-bold tracking-tighter transition-all group-hover/info:opacity-0">
                          ID: USER-{c.id} • PW: ••••••••
                        </p>
                        <p className="absolute top-0 left-0 text-[10px] text-blue-600 font-black uppercase tracking-widest opacity-0 group-hover/info:opacity-100 transition-all whitespace-nowrap">
                          ID: {c.id} | PASS: <span className="bg-blue-50 px-1 rounded">{c.password || "********"}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="text-sm font-bold text-slate-600">
                  <span className="bg-slate-100 px-3 py-1 rounded-lg text-[11px]">{c.phone}</span>
                </td>
                <td className="text-[11px] text-slate-400 max-w-[200px] font-medium leading-relaxed">
                  {c.address || "Chưa cập nhật"}
                </td>
                <td className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                  {/* --- SỬA LỖI INVALID DATE --- */}
                  {c.createdAt || c.created_at 
                    ? new Date(c.createdAt || c.created_at).toLocaleDateString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      }) 
                    : "Chưa rõ"}
                </td>
                <td className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={() => setEditingUser(c)}
                      className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                      title="Chỉnh sửa"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleDelete(c.id)}
                      className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                      title="Xóa tài khoản"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- PHẦN MODAL GIỮ NGUYÊN NHƯ CODE CŨ CỦA BẠN --- */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-slideUp">
            <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
              <h4 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Sửa thông tin khách</h4>
              <button onClick={() => setEditingUser(null)} className="w-10 h-10 bg-white rounded-full shadow-md flex items-center justify-center font-bold hover:text-red-500 transition-all">✕</button>
            </div>
            <form onSubmit={handleUpdate} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Họ và Tên</label>
                <input 
                  type="text" 
                  value={editingUser.fullName}
                  onChange={(e) => setEditingUser({...editingUser, fullName: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Số điện thoại</label>
                <input 
                  type="text" 
                  value={editingUser.phone}
                  onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase ml-2">Địa chỉ</label>
                <textarea 
                  value={editingUser.address}
                  onChange={(e) => setEditingUser({...editingUser, address: e.target.value})}
                  className="w-full bg-slate-50 border-none rounded-2xl py-4 px-6 font-bold outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  required
                />
              </div>
              <div className="pt-4 flex gap-4">
                 <button type="button" onClick={() => setEditingUser(null)} className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black text-[11px] uppercase tracking-widest">Hủy</button>
                 <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all">Lưu thay đổi</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}