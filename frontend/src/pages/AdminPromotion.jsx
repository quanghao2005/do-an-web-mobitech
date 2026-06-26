import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminPromotion() {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    id: null, code: '', name: '', discountType: 'FIXED', 
    discountValue: '', minOrderValue: '', 
    startDate: '', endDate: '', usageLimit: '', status: 1,
    isPublic: 1
  });

  useEffect(() => { loadPromotions(); }, []);

  const loadPromotions = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/promotions');
      setPromotions(res.data);
    } catch (err) { console.error("Lỗi tải khuyến mãi:", err); }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/promotions/${id}/toggle-status`);
      loadPromotions(); 
    } catch (err) { alert("Lỗi cập nhật!"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const dataToSend = { 
      ...form, 
      discountValue: parseFloat(form.discountValue),
      minOrderValue: parseFloat(form.minOrderValue),
      usageLimit: parseInt(form.usageLimit)
    };
    
    try {
      if (form.id) await axios.put(`http://localhost:8080/api/promotions/${form.id}`, dataToSend);
      else await axios.post('http://localhost:8080/api/promotions', dataToSend);
      setShowModal(false);
      loadPromotions();
      alert("Cập nhật khuyến mãi thành công!");
    } catch (err) { alert("Lỗi lưu dữ liệu!"); } finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa chương trình khuyến mãi này?")) {
      try { await axios.delete(`http://localhost:8080/api/promotions/${id}`); loadPromotions(); } 
      catch (err) { alert("Lỗi xóa!"); }
    }
  };

  return (
    <div className="p-8 font-sans bg-slate-50 min-h-screen animate-fadeIn italic">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 px-4">
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">QUẢN LÝ KHUYẾN MÃI</h3>
        <button onClick={() => { 
            setForm({id: null, code: '', name: '', discountType: 'FIXED', discountValue: '', minOrderValue: '', startDate: '', endDate: '', usageLimit: '', status: 1}); 
            setShowModal(true); 
          }} 
          className="bg-red-500 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase shadow-2xl hover:bg-red-600 transition-all italic">
          + Tạo Voucher Mới
        </button>
      </div>

      {/* BẢNG DANH SÁCH VOUCHER */}
      <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse italic text-sm">
          <thead className="bg-red-50/50 border-b border-red-50 text-[10px] font-black text-red-400 uppercase tracking-widest italic">
            <tr>
              <th className="p-8">Chương trình</th>
              <th className="text-center">Mức giảm</th>
              <th className="text-center">Đã dùng</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center p-8">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {promotions.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition italic">
                <td className="p-8">
                  <p className="font-black text-slate-800 uppercase tracking-tighter">{p.name}</p>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">MÃ: <span className="text-red-500">{p.code}</span></p>
                </td>
                <td className="text-center font-black text-blue-600">
                  {p.discountType === 'PERCENT' ? `${p.discountValue}%` : `${p.discountValue?.toLocaleString()}đ`}
                  <div className="text-[9px] text-slate-400 mt-1">Đơn từ {p.minOrderValue?.toLocaleString()}đ</div>
                </td>
                <td className="text-center font-bold text-slate-500">
                  {p.usedCount} / {p.usageLimit}
                </td>
                <td className="text-center">
                  {new Date(p.endDate) < new Date() ? (
                    <span className="px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase italic bg-red-100 text-red-600">🔴 Hết hạn</span>
                  ) : (
                    <button onClick={() => handleToggleStatus(p.id)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase italic ${p.status === 1 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                      {p.status === 1 ? '🟢 Đang chạy' : '⚪ Tạm dừng'}
                    </button>
                  )}
                </td>
                <td className="p-8 text-center space-x-3">
                  <button onClick={() => { setForm(p); setShowModal(true); }} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl italic hover:bg-blue-600 hover:text-white transition-all">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-5 py-3 rounded-2xl italic hover:bg-red-500 hover:text-white transition-all">Xóa</button>
                </td>
              </tr>
            ))}
            {promotions.length === 0 && (
              <tr><td colSpan="5" className="text-center py-20 text-slate-300 font-bold uppercase text-xs">Chưa có mã khuyến mãi nào</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL THÊM/SỬA VOUCHER */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-fadeIn italic">
          <div className="bg-white rounded-[4.5rem] w-full max-w-4xl p-16 shadow-2xl relative italic">
            <div className="flex justify-between items-start mb-8">
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">THIẾT LẬP VOUCHER</h3>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input className="col-span-2 p-5 bg-slate-50 rounded-3xl font-bold border-none outline-none" placeholder="Tên chương trình (VD: Sale Lớn Mùa Hè)" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <input className="p-5 bg-red-50 text-red-600 rounded-3xl font-black uppercase border-none outline-none placeholder:text-red-300" placeholder="MÃ CODE (VD: HESALE500)" value={form.code} onChange={e => setForm({...form, code: e.target.value})} required />
                
                <select className="p-5 bg-slate-50 rounded-3xl font-bold outline-none border-none" value={form.discountType} onChange={e => setForm({...form, discountType: e.target.value})}>
                    <option value="FIXED">Giảm theo số tiền (VNĐ)</option>
                    <option value="PERCENT">Giảm theo phần trăm (%)</option>
                </select>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-blue-600">Mức giảm</label>
                  <input type="number" className="p-5 bg-white border border-blue-100 rounded-3xl font-bold text-blue-600 outline-none shadow-sm" placeholder={form.discountType === 'PERCENT' ? "Nhập % giảm..." : "Nhập số tiền giảm..."} value={form.discountValue} onChange={e => setForm({...form, discountValue: e.target.value})} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-slate-400">Đơn tối thiểu để áp dụng</label>
                  <input type="number" className="p-5 bg-slate-50 rounded-3xl font-bold text-slate-600 outline-none border-none" placeholder="VD: 5000000" value={form.minOrderValue} onChange={e => setForm({...form, minOrderValue: e.target.value})} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-slate-400">Ngày bắt đầu</label>
                  <input type="datetime-local" className="p-5 bg-slate-50 rounded-3xl font-bold text-slate-600 outline-none border-none" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})} required />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-slate-400">Ngày kết thúc</label>
                  <input type="datetime-local" className="p-5 bg-slate-50 rounded-3xl font-bold text-slate-600 outline-none border-none" value={form.endDate} onChange={e => setForm({...form, endDate: e.target.value})} required />
                </div>

                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-slate-400">Giới hạn số lượt sử dụng</label>
                  <input type="number" className="p-5 bg-slate-50 rounded-3xl font-bold text-slate-600 outline-none border-none" placeholder="VD: 100 (Chỉ 100 người được dùng)" value={form.usageLimit} onChange={e => setForm({...form, usageLimit: e.target.value})} required />
                </div>

                {/* THÊM KHỐI NÀY VÀO: LỰA CHỌN HIỂN THỊ */}
                <div className="col-span-2 flex flex-col gap-2 mt-2">
                  <label className="text-[9px] font-black uppercase ml-4 text-blue-600">Hiển thị cho khách hàng?</label>
                  <select 
                    className="p-5 bg-blue-50 text-blue-700 rounded-3xl font-bold outline-none border-none shadow-inner" 
                    value={form.isPublic} 
                    onChange={e => setForm({...form, isPublic: Number(e.target.value)})}
                  >
                      <option value={1}>👀 Hiển thị công khai (Hiện trên Popup và Kho Voucher)</option>
                      <option value={0}>🙈 Ẩn mã này (Khách phải tự nhập tay / Mã bí mật)</option>
                  </select>
                </div>
              </div>

              <div className="pt-6 flex gap-6 border-t border-slate-100 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 font-black text-slate-400 uppercase text-xs bg-slate-50 rounded-[2.5rem] hover:bg-slate-100 transition-all">HỦY BỎ</button>
                <button type="submit" disabled={loading} className="flex-[2] bg-red-500 text-white py-5 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl hover:bg-red-600 active:scale-[0.98] transition-all">
                    {loading ? "ĐANG XỬ LÝ..." : "LƯU KHUYẾN MÃI"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}