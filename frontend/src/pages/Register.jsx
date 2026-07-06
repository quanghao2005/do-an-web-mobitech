import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import SearchableSelect from "../components/SearchableSelect";

export default function Register() {
  const navigate = useNavigate();

  // 1. State quản lý Form chính
  const [form, setForm] = useState({
    fullName: '', phone: '', address: '', username: '', password: '', role: 'USER', email: ''
  });
  
  // 2. State quản lý Avatar
  const [avatar, setAvatar] = useState(""); 

  // 3. State quản lý API địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  useEffect(() => {
    axios.get("/addresses.json")
      .then((res) => setProvinces(res.data.provinces))
      .catch(err => console.error("Lỗi tải tỉnh thành:", err));
  }, []);

  // Xử lý chọn ảnh Avatar (Base64)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleProvinceChange = (e) => {
    const pCode = e.target.value;
    setSelectedProvince(pCode);
    setSelectedWard("");
    setWards([]);
    if (pCode) {
      if (pCode === "72") {
        axios.get("/addresses.json").then((res) => {
          setWards(res.data.wards);
        });
      } else {
        axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=3`).then((res) => {
          const allWards = [];
          if (res.data.districts) {
            res.data.districts.forEach(d => {
              if (d.wards) {
                allWards.push(...d.wards);
              }
            });
          }
          setWards(allWards);
        }).catch(() => setWards([]));
      }
    }
  };

  // --- HÀM XỬ LÝ ĐĂNG KÝ VÀ KIỂM TRA SỐ ĐIỆN THOẠI ---
  const handleRegister = (e) => {
    e.preventDefault();

    // KIỂM TRA SỐ ĐIỆN THOẠI: Bắt đầu bằng 0, là số, đúng 10 ký tự
    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(form.phone)) {
      alert("⚠️ Số điện thoại không hợp lệ! Vui lòng nhập đúng 10 chữ số và bắt đầu bằng số 0.");
      return;
    }

    const pName = provinces.find(p => p.code == selectedProvince)?.name || "";
    const wName = wards.find(w => w.code == selectedWard)?.name || "";
    const fullAddress = `${detailAddress}, ${wName}, ${pName}`;

    const dataToSend = { 
        ...form, 
        address: fullAddress,
        avatar: avatar 
    };

    axios.post('http://localhost:8080/api/auth/register', dataToSend)
      .then(() => {
        alert("🎉 Đăng ký tài khoản thành công!");
        navigate('/login');
      })
      .catch((err) => {
        console.error(err);
        alert("Lỗi đăng ký! Tài khoản có thể đã tồn tại hoặc dữ liệu không hợp lệ.");
      });
  };

  return (
    <div className="min-h-screen bg-[#f4f7fa] flex items-center justify-center p-6 font-sans italic">
      <div className="w-full max-w-[550px] bg-white rounded-[3rem] p-10 shadow-[0_40px_80px_-15px_rgba(0,0,0,0.05)] border border-gray-50 animate-fadeIn italic">
        
        <div className="text-center mb-6 italic">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600 bg-blue-50 px-3 py-1 rounded-full italic">Membership</span>
          <h2 className="text-3xl font-black text-gray-900 mt-4 tracking-tight uppercase italic">Tạo tài khoản</h2>
        </div>

        {/* PHẦN CHỌN AVATAR */}
        <div className="flex flex-col items-center mb-8 italic">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-slate-100 bg-slate-50 flex items-center justify-center transition-transform group-hover:scale-105 italic">
              {avatar ? <img src={avatar} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-slate-300 text-3xl">👤</span>}
            </div>
            <label className="absolute bottom-0 right-0 bg-blue-600 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer border-2 border-white hover:bg-blue-700 transition-all shadow-md active:scale-90">
              <span className="text-white text-[10px]">📷</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <p className="text-[9px] font-black text-gray-400 uppercase mt-3 tracking-widest italic">Ảnh đại diện (Tùy chọn)</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4 italic">
          <input className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" placeholder="Họ và Tên" onChange={e => setForm({...form, fullName: e.target.value})} required />
          <input type="email" className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" placeholder="Email" onChange={e => setForm({...form, email: e.target.value})} required />
          
          <div className="grid grid-cols-2 gap-4 italic">
            <input 
              className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" 
              placeholder="Số điện thoại (10 số)" 
              value={form.phone}
              maxLength={10}
              onChange={e => {
                // Chỉ cho phép nhập số
                const val = e.target.value.replace(/\D/g, "");
                setForm({...form, phone: val});
              }} 
              required 
            />
            <input className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} required />
          </div>

          <div className="space-y-3 italic">
            <p className="text-[10px] font-black text-gray-400 uppercase ml-2 tracking-widest italic">Địa chỉ nhận hàng</p>
            <div className="grid grid-cols-2 gap-2 italic z-10 relative">
              <SearchableSelect 
                options={provinces} 
                value={selectedProvince} 
                onChange={(code) => handleProvinceChange({ target: { value: code } })} 
                placeholder="-- Chọn tỉnh / TP --" 
              />
              <SearchableSelect 
                options={wards} 
                value={selectedWard} 
                onChange={(code) => setSelectedWard(code)} 
                placeholder="-- Chọn phường / xã --" 
                disabled={!selectedProvince} 
              />
            </div>
            <input className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" placeholder="Số nhà, tên đường..." value={detailAddress} onChange={e => setDetailAddress(e.target.value)} required />
          </div>

          <input className="w-full px-6 py-4 bg-gray-50 border-none rounded-2xl text-sm font-bold outline-none italic" type="password" placeholder="Mật khẩu" onChange={e => setForm({...form, password: e.target.value})} required />

          <button className="w-full bg-gray-900 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-xl mt-4 active:scale-95 italic">
            Xác nhận tạo tài khoản
          </button>
        </form>

        <div className="mt-8 text-center italic">
          <p className="text-gray-400 text-[10px] font-bold italic">ĐÃ CÓ TÀI KHOẢN? <Link to="/login" className="text-gray-900 font-black hover:text-blue-600 transition ml-2 underline underline-offset-8">ĐĂNG NHẬP</Link></p>
        </div>
      </div>
    </div>
  );
}