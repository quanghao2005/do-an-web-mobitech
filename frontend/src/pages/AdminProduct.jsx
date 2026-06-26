import { useState, useEffect } from 'react';
import axios from 'axios';

export default function AdminProduct() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // 1. FORM STATE: Đã thêm stock: ''
  const [form, setForm] = useState({
    id: null, name: '', price: '', oldPrice: '', stock: '', imageUrl: '', 
    description: '[]', 
    ramOptions: '[]',  
    category: { id: '' },
    brand: { id: '' },
    os: '', cpu: '', gpu: '', ram: '', storage: '',
    screen: '', screenTech: '', camera: '', selfie: '',
    battery: '', batteryType: '', charging: '', security: '',
    colorVariants: [],
    status: 1 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [resProd, resCate, resBrand] = await Promise.all([
        axios.get('http://localhost:8080/api/products'),
        axios.get('http://localhost:8080/api/categories'),
        axios.get('http://localhost:8080/api/brands')
      ]);
      setProducts(resProd.data);
      setCategories(resCate.data);
      setBrands(resBrand.data);
    } catch (err) { 
      console.error("Lỗi tải dữ liệu:", err);
    }
  };

  const handleToggleStatus = async (productId) => {
    try {
      await axios.put(`http://localhost:8080/api/products/${productId}/toggle-status`);
      loadData(); 
    } catch (err) {
      alert("Lỗi cập nhật trạng thái!");
    }
  };

  const handleMainFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, imageUrl: reader.result });
      reader.readAsDataURL(file);
    }
  };

  // --- LOGIC XỬ LÝ RAM & DESCRIPTION ---
  const addRamOption = () => {
    let options = [];
    try { options = JSON.parse(form.ramOptions || "[]"); } catch (e) { options = []; }
    setForm({ ...form, ramOptions: JSON.stringify([...options, { label: '', extra: 0 }]) });
  };
  const updateRamOption = (index, field, value) => {
    const options = JSON.parse(form.ramOptions);
    options[index][field] = value;
    setForm({ ...form, ramOptions: JSON.stringify(options) });
  };
  const addDescStep = (type) => {
    let steps = [];
    try { steps = JSON.parse(form.description || "[]"); } catch (e) { steps = []; }
    const newStep = type === 'text' ? { type: 'text', content: '' } : { type: 'image', content: '' };
    setForm({ ...form, description: JSON.stringify([...steps, newStep]) });
  };
  const updateDescStep = (index, value) => {
    const steps = JSON.parse(form.description);
    steps[index].content = value;
    setForm({ ...form, description: JSON.stringify(steps) });
  };
  const handleDescImage = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => updateDescStep(index, reader.result);
      reader.readAsDataURL(file);
    }
  };
  const removeDescStep = (index) => {
    const steps = JSON.parse(form.description);
    const newSteps = steps.filter((_, i) => i !== index);
    setForm({ ...form, description: JSON.stringify(newSteps) });
  };
  const addColorVariant = () => {
    setForm({ ...form, colorVariants: [...form.colorVariants, { colorName: '', imageUrl: '', hex: '#000000' }] });
  };
  const handleVariantFileChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newVariants = [...form.colorVariants];
        newVariants[index].imageUrl = reader.result;
        setForm({ ...form, colorVariants: newVariants });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- MODAL CONTROL ---
  const handleAddClick = () => {
    setForm({ 
        id: null, name: '', price: '', oldPrice: '', stock: '', imageUrl: '', 
        description: '[]', ramOptions: '[]', category: { id: '' }, brand: { id: '' },
        os: '', cpu: '', ram: '', storage: '',
        screen: '', screenTech: '', camera: '', selfie: '',
        battery: '', batteryType: '', charging: '', security: '',
        colorVariants: [], status: 1 
    });
    setShowModal(true);
  };

  const handleEditClick = (p) => {
    let variants = p.colorVariants;
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch (e) { variants = []; }
    }
    setForm({ 
        ...p, 
        oldPrice: p.oldPrice || '', 
        stock: p.stock || 0, // Đảm bảo lấy stock khi sửa
        category: { id: p.category?.id || '' }, 
        brand: { id: p.brand?.id || '' },
        gpu: p.gpu || '',
        colorVariants: variants || [],
        description: p.description && p.description.startsWith('[') ? p.description : "[]",
        ramOptions: p.ramOptions && p.ramOptions.startsWith('[') ? p.ramOptions : "[]",
        status: p.status ?? 1
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // XỬ LÝ DỮ LIỆU: Thêm parse stock
    const dataToSend = { 
      ...form, 
      price: parseFloat(form.price),
      oldPrice: form.oldPrice === '' ? null : parseFloat(form.oldPrice),
      stock: parseInt(form.stock) || 0, // Chuyển stock thành số
      colorVariants: JSON.stringify(form.colorVariants) 
    };

    try {
      if (form.id) {
        await axios.put(`http://localhost:8080/api/products/${form.id}`, dataToSend);
      } else {
        await axios.post('http://localhost:8080/api/products', dataToSend);
      }
      setShowModal(false);
      loadData();
      alert("Cập nhật dữ liệu sản phẩm thành công!");
    } catch (err) { 
      console.error(err);
      alert("Lỗi lưu dữ liệu! Hãy kiểm tra lại Backend.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Xác nhận xóa máy này khỏi hệ thống?")) {
      try {
        await axios.delete(`http://localhost:8080/api/products/${id}`);
        loadData();
      } catch (err) { alert("Lỗi xóa!"); }
    }
  };

  return (
    <div className="p-8 font-sans bg-slate-50 min-h-screen animate-fadeIn italic">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>

      {/* HEADER */}
      <div className="flex justify-between items-center mb-10 px-4">
        <h3 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">QUẢN TRỊ KHO HÀNG</h3>
        <button onClick={handleAddClick} className="bg-slate-900 text-white px-10 py-5 rounded-[2rem] font-black text-xs uppercase shadow-2xl hover:bg-blue-600 transition-all italic">+ Nhập máy mới</button>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white rounded-[4rem] shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse italic text-sm">
          <thead className="bg-slate-50/50 border-b border-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest italic">
            <tr>
              <th className="p-8">Sản phẩm</th>
              <th className="text-center">Tồn Kho</th>
              <th className="text-center">Giá Niêm Yết (Sale)</th>
              <th className="text-center">Trạng thái</th>
              <th className="text-center p-8">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50/30 transition italic">
                <td className="p-8 flex items-center gap-6 italic font-bold uppercase text-slate-800 tracking-tighter">
                  <img src={p.imageUrl} className="w-16 h-16 object-contain" alt="" /> {p.name}
                </td>
                
                <td className="text-center italic font-black text-orange-600 text-lg">
                  {p.stock || 0}
                </td>

                <td className="text-center italic font-bold">
                  <span className="text-blue-600">{p.price?.toLocaleString()}đ</span>
                  {p.oldPrice > p.price && (
                    <div className="text-[9px] text-red-400 line-through opacity-60 italic">{p.oldPrice?.toLocaleString()}đ</div>
                  )}
                </td>
                <td className="text-center">
                  <button onClick={() => handleToggleStatus(p.id)} className={`px-5 py-2.5 rounded-2xl text-[9px] font-black uppercase italic ${p.status === 1 ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                    {p.status === 1 ? '🟢 Hiện' : '⚪ Ẩn'}
                  </button>
                </td>
                <td className="p-8 text-center space-x-3">
                  <button onClick={() => handleEditClick(p)} className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-5 py-3 rounded-2xl italic hover:bg-blue-600 hover:text-white transition-all">Sửa</button>
                  <button onClick={() => handleDelete(p.id)} className="text-[10px] font-black uppercase text-red-500 bg-red-50 px-5 py-3 rounded-2xl italic hover:bg-red-500 hover:text-white transition-all">Xóa</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CẤU HÌNH */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl flex items-center justify-center p-6 z-50 animate-fadeIn italic">
          <div className="bg-white rounded-[4.5rem] w-full max-w-7xl p-16 shadow-2xl overflow-hidden max-h-[95vh] flex flex-col relative italic">
            <div className="flex justify-between items-start mb-8 italic">
                <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter italic">THIẾT LẬP CẤU HÌNH</h3>
                <button onClick={() => setShowModal(false)} className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold hover:bg-red-500 hover:text-white transition-all">✕</button>
            </div>
            
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-6 custom-scrollbar space-y-12 pb-10 italic">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 italic">
                
                {/* CỘT TRÁI: GIÁ & GIẢM GIÁ */}
                <div className="lg:col-span-5 space-y-8 italic">
                    <div className="flex items-center gap-8 bg-slate-50 p-8 rounded-[3.5rem] border border-slate-100 italic shadow-inner">
                      <div className="w-40 h-40 bg-white rounded-[2.5rem] flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-200">
                        {form.imageUrl ? <img src={form.imageUrl} className="w-full h-full object-contain p-2" alt="" /> : <span className="text-[10px] text-slate-300">IMAGE</span>}
                      </div>
                      <label className="bg-slate-900 text-white px-8 py-5 rounded-2xl text-[10px] font-black uppercase cursor-pointer hover:bg-blue-600 transition-all italic shadow-lg active:scale-95">
                          Tải ảnh chính
                          <input type="file" className="hidden" accept="image/*" onChange={handleMainFileChange} />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4 italic">
                        <input className="col-span-2 p-5 bg-slate-50 rounded-3xl font-bold italic border-none outline-none shadow-sm" placeholder="Tên sản phẩm" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                        
                        {/* INPUT GIÁ HIỆN TẠI */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black uppercase ml-4 text-blue-600 italic">Giá bán hiện tại</label>
                          <input className="p-5 bg-white border border-blue-100 rounded-3xl font-bold text-blue-600 italic outline-none shadow-md" type="number" placeholder="Giá bán" value={form.price || ''} onChange={e => setForm({...form, price: e.target.value})} required />
                        </div>

                        {/* INPUT GIÁ CŨ (Dùng để giảm giá) */}
                        <div className="flex flex-col gap-2">
                          <label className="text-[9px] font-black uppercase ml-4 text-slate-400 italic">Giá gốc (Để Sale)</label>
                          <input className="p-5 bg-slate-50 rounded-3xl font-bold text-slate-400 italic border-none outline-none shadow-inner" type="number" placeholder="Giá gốc" value={form.oldPrice || ''} onChange={e => setForm({...form, oldPrice: e.target.value})} />
                        </div>

                        {/* Tồn kho không còn cho phép chỉnh sửa ở đây nữa. Bắt buộc phải qua tab Nhập kho để tính dòng tiền. */}
                        <div className="col-span-2 flex gap-4">
                            <select className="flex-1 p-5 bg-slate-50 rounded-3xl font-bold italic outline-none border-none shadow-sm" value={form.category.id} onChange={e => setForm({...form, category: { id: e.target.value }})} required>
                                <option value="">Chọn Danh mục</option>
                                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            <select className="flex-1 p-5 bg-slate-50 rounded-3xl font-bold italic outline-none border-none shadow-sm" value={form.brand.id} onChange={e => setForm({...form, brand: { id: e.target.value }})} required>
                                <option value="">Chọn Thương hiệu</option>
                                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </div>
                    </div>

                    {/* DUNG LƯỢNG */}
                    <div className="bg-white p-8 rounded-[3.5rem] border border-slate-100 space-y-6 shadow-xl shadow-slate-100/50 italic">
                        <div className="flex justify-between items-center italic">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic">💾 Tùy chọn bộ nhớ</p>
                           <button type="button" onClick={addRamOption} className="bg-blue-600 text-white text-[9px] px-4 py-2 rounded-xl font-black italic shadow-lg">+ THÊM</button>
                        </div>
                        <div className="space-y-3 italic">
                           {JSON.parse(form.ramOptions || "[]").map((opt, idx) => (
                             <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2 rounded-2xl italic">
                               <input placeholder="256GB" className="w-24 p-3 bg-white rounded-xl text-[10px] font-bold outline-none italic shadow-sm" value={opt.label} onChange={e => updateRamOption(idx, 'label', e.target.value)} />
                               <input type="number" placeholder="+ Tiền" className="flex-1 p-3 bg-white rounded-xl text-[10px] font-bold text-blue-600 outline-none italic shadow-sm" value={opt.extra} onChange={e => updateRamOption(idx, 'extra', parseInt(e.target.value) || 0)} />
                               <button type="button" onClick={() => { const o = JSON.parse(form.ramOptions); o.splice(idx,1); setForm({...form, ramOptions: JSON.stringify(o)}); }} className="text-red-500 font-black px-2 hover:scale-125 transition-all">✕</button>
                             </div>
                           ))}
                        </div>
                    </div>
                </div>

                {/* CỘT GIỮA: SPECS */}
                <div className="lg:col-span-4 bg-blue-50/50 p-8 rounded-[4rem] border border-blue-100/50 space-y-4 italic shadow-inner">
                    <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest italic mb-2 italic">⚙️ Accordion Specs</p>
                    <input placeholder="Hệ điều hành" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.os} onChange={e => setForm({...form, os: e.target.value})} />
                    <input placeholder="Vi xử lý (CPU)" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.cpu} onChange={e => setForm({...form, cpu: e.target.value})} />
                    <input placeholder="Chip đồ họa (GPU)" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.gpu || ''} onChange={e => setForm({...form, gpu: e.target.value})} />
                    <input placeholder="RAM hiển thị" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.ram} onChange={e => setForm({...form, ram: e.target.value})} />
                    <input placeholder="Màn hình" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.screen} onChange={e => setForm({...form, screen: e.target.value})} />
                    <input placeholder="Camera sau" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.camera} onChange={e => setForm({...form, camera: e.target.value})} />
                    <input placeholder="Pin & Sạc" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.battery} onChange={e => setForm({...form, battery: e.target.value})} />
                    <input placeholder="Bảo mật" className="w-full p-4 bg-white rounded-2xl text-xs font-bold italic shadow-sm border-none outline-none" value={form.security} onChange={e => setForm({...form, security: e.target.value})} />
                </div>

                {/* CỘT PHẢI: ALBUM & MÀU */}
                <div className="lg:col-span-3 space-y-8 italic">
                    <div className="bg-slate-900 p-8 rounded-[4rem] shadow-2xl space-y-6 italic">
                        <div className="flex justify-between items-center text-white italic">
                            <p className="text-[10px] font-black uppercase tracking-widest italic">📸 Album Review</p>
                            <div className="flex gap-2 italic">
                                <button type="button" onClick={() => addDescStep('text')} className="bg-white/10 px-3 py-2 rounded-xl text-[8px] font-black uppercase italic hover:bg-white/20 transition-all">🖋 T</button>
                                <button type="button" onClick={() => addDescStep('image')} className="bg-blue-600 px-3 py-2 rounded-xl text-[8px] font-black uppercase italic hover:bg-blue-500 transition-all">🖼 I</button>
                            </div>
                        </div>
                        <div className="space-y-4 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar italic">
                            {JSON.parse(form.description || "[]").map((step, idx) => (
                                <div key={idx} className="relative bg-white/5 p-4 rounded-3xl group border border-white/5 italic shadow-lg">
                                    {step.type === 'text' ? (
                                        <textarea className="w-full bg-transparent text-white text-[10px] font-medium italic outline-none min-h-[60px] resize-none italic" placeholder="Mô tả..." value={step.content} onChange={e => updateDescStep(idx, e.target.value)} />
                                    ) : (
                                        <div className="flex flex-col gap-3 italic">
                                            <div className="w-full h-24 bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden italic shadow-inner">
                                                {step.content ? <img src={step.content} className="h-full object-contain p-1" alt="" /> : <span className="text-[8px] text-white/20 italic">No Pic</span>}
                                            </div>
                                            <input type="file" accept="image/*" onChange={e => handleDescImage(idx, e)} className="text-[8px] text-white/40 italic" />
                                        </div>
                                    )}
                                    <button type="button" onClick={() => removeDescStep(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white w-6 h-6 rounded-full text-[10px] italic shadow-md hover:scale-110 transition-all">✕</button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-slate-100 p-8 rounded-[4rem] space-y-6 shadow-inner border border-slate-200 italic">
                        <div className="flex justify-between items-center italic">
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-800 italic">🎨 Màu sắc</p>
                           <button type="button" onClick={addColorVariant} className="bg-slate-900 text-white text-[8px] px-4 py-2 rounded-xl font-black italic shadow-lg hover:bg-slate-800 transition-all">+ MÀU</button>
                        </div>
                        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar italic">
                          {form.colorVariants.map((variant, index) => (
                            <div key={index} className="bg-white p-4 rounded-3xl flex flex-col gap-4 relative shadow-md border border-slate-100 italic">
                                <div className="flex items-center gap-4 italic">
                                    <div className="w-16 h-16 bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center italic shadow-inner">
                                        {variant.imageUrl ? <img src={variant.imageUrl} className="h-full object-contain" alt="" /> : <span className="text-[8px] text-slate-300 italic">No IMG</span>}
                                    </div>
                                    <div className="flex-1 italic">
                                        <input placeholder="Tên màu" className="w-full bg-slate-50 p-2 rounded-xl text-[10px] font-bold italic mb-2 border-none outline-none italic shadow-inner" value={variant.colorName} onChange={e => { const newV = [...form.colorVariants]; newV[index].colorName = e.target.value; setForm({...form, colorVariants: newV}); }} />
                                        <div className="flex justify-between items-center italic">
                                            <input type="color" className="w-8 h-8 rounded-full border-none p-0 cursor-pointer italic" value={variant.hex} onChange={e => { const newV = [...form.colorVariants]; newV[index].hex = e.target.value; setForm({...form, colorVariants: newV}); }} />
                                            <label className="bg-slate-100 px-3 py-2 rounded-lg text-[8px] font-black uppercase cursor-pointer hover:bg-slate-900 hover:text-white transition-all italic italic shadow-sm">UPLOAD <input type="file" className="hidden" accept="image/*" onChange={(e) => handleVariantFileChange(index, e)} /></label>
                                        </div>
                                    </div>
                                </div>
                                <button type="button" onClick={() => setForm({...form, colorVariants: form.colorVariants.filter((_, i) => i !== index)})} className="bg-red-50 text-red-500 w-6 h-6 rounded-full text-[10px] absolute -top-1 -right-1 italic shadow-sm hover:scale-110 transition-all">✕</button>
                            </div>
                          ))}
                        </div>
                    </div>
                </div>
              </div>

              {/* NÚT THAO TÁC CUỐI CÙNG */}
              <div className="sticky bottom-0 bg-white py-6 flex gap-6 border-t border-slate-100 z-10 italic">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-7 font-black text-slate-400 uppercase text-xs bg-slate-50 rounded-[2.5rem] italic hover:bg-slate-100 transition-all">HỦY BỎ</button>
                <button type="submit" disabled={loading} className="flex-[3] bg-blue-600 text-white py-7 rounded-[2.5rem] font-black uppercase text-xs shadow-2xl hover:bg-blue-700 active:scale-[0.98] transition-all italic">
                    {loading ? "ĐANG LƯU KHO..." : "XÁC NHẬN CẬP NHẬT DỮ LIỆU"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}