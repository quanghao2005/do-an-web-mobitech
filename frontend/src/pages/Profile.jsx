import { useState, useEffect } from "react";
import axios from "axios";

export default function Profile() {
  const [formData, setFormData] = useState({
    fullName: localStorage.getItem("fullName") || "",
    phone: localStorage.getItem("phone") || "",
  });

  // State quản lý Avatar - Lấy từ LocalStorage để tránh mất khi reload
  const [avatar, setAvatar] = useState(localStorage.getItem("avatar") || "");

  // State quản lý địa chỉ
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  // 1. Tải dữ liệu tỉnh thành và đổ ngược dữ liệu cũ
  useEffect(() => {
    const savedAddress = localStorage.getItem("address");
    
    axios.get("https://provinces.open-api.vn/api/p/")
      .then((res) => {
        setProvinces(res.data);
        
        if (savedAddress && savedAddress !== "Chưa cập nhật") {
          const parts = savedAddress.split(", "); 
          if (parts.length >= 4) {
            setDetailAddress(parts[0]);
            
            const province = res.data.find(p => p.name === parts[3]);
            if (province) {
              setSelectedProvince(province.code);
              
              axios.get(`https://provinces.open-api.vn/api/p/${province.code}?depth=2`)
                .then(resDist => {
                  setDistricts(resDist.data.districts);
                  const district = resDist.data.districts.find(d => d.name === parts[2]);
                  if (district) {
                    setSelectedDistrict(district.code);
                    
                    axios.get(`https://provinces.open-api.vn/api/d/${district.code}?depth=2`)
                      .then(resWard => {
                        setWards(resWard.data.wards);
                        const ward = resWard.data.wards.find(w => w.name === parts[1]);
                        if (ward) setSelectedWard(ward.code);
                      });
                  }
                });
            }
          }
        }
      });
  }, []);

  // 2. Xử lý chọn ảnh và chuyển sang Base64
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result); // Chuỗi Base64
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProvinceChange = (e) => {
    const pCode = e.target.value;
    setSelectedProvince(pCode);
    setSelectedDistrict(""); setSelectedWard("");
    setDistricts([]); setWards([]);
    if (pCode) {
      axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`)
        .then((res) => setDistricts(res.data.districts));
    }
  };

  const handleDistrictChange = (e) => {
    const dCode = e.target.value;
    setSelectedDistrict(dCode);
    setSelectedWard(""); setWards([]);
    if (dCode) {
      axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`)
        .then((res) => setWards(res.data.wards));
    }
  };

  // 3. Hàm cập nhật hồ sơ
  const handleUpdate = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    const pName = provinces.find(p => p.code == selectedProvince)?.name || "";
    const dName = districts.find(d => d.code == selectedDistrict)?.name || "";
    const wName = wards.find(w => w.code == selectedWard)?.name || "";
    const fullAddress = `${detailAddress}, ${wName}, ${dName}, ${pName}`;

    const dataToSave = {
      ...formData,
      address: fullAddress,
      avatar: avatar 
    };

    try {
      // Gửi dữ liệu lên Server
      await axios.put(`http://localhost:8080/api/users/${userId}`, dataToSave, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // LƯU VÀO LOCAL STORAGE
      localStorage.setItem("avatar", avatar);
      localStorage.setItem("fullName", formData.fullName);
      localStorage.setItem("phone", formData.phone);
      localStorage.setItem("address", fullAddress);

      // Cập nhật lại đối tượng user chung (nếu có dùng ở Navbar)
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { 
        ...currentUser, 
        fullName: formData.fullName, 
        avatar: avatar,
        address: fullAddress
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("Cập nhật hồ sơ thành công!");
      
      // Báo hiệu cho các Component khác (Navbar) biết để load lại ảnh
      window.dispatchEvent(new Event("profileUpdated"));
      
      // Reload để đồng bộ lại toàn bộ trạng thái app
      window.location.reload(); 
    } catch (err) {
      alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans text-slate-900">
      <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl p-10 border border-slate-100 animate-fadeIn">
        
        {/* PHẦN HIỂN THỊ AVATAR */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative group">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl ring-2 ring-slate-100 transition-transform group-hover:scale-105">
              {avatar ? (
                <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center text-4xl font-black">
                  {formData.fullName ? formData.fullName.charAt(0).toUpperCase() : "?"}
                </div>
              )}
            </div>
            <label className="absolute bottom-1 right-1 bg-blue-600 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer border-4 border-white hover:bg-blue-700 transition-all shadow-lg active:scale-90">
              <span className="text-white text-lg">📷</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
            </label>
          </div>
          <h2 className="text-2xl font-black mt-4 tracking-tighter uppercase">Hồ sơ cá nhân</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.2em]">Quản lý thông tin định danh</p>
        </div>

        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Họ và tên</label>
              <input type="text" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" required />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Số điện thoại</label>
              <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-50 border-none rounded-2xl py-3.5 px-5 font-bold focus:ring-2 focus:ring-blue-500/20 outline-none" required />
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-4 tracking-widest">Địa chỉ giao hàng</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select value={selectedProvince} onChange={handleProvinceChange} className="bg-slate-50 border-none rounded-xl py-3 px-3 text-xs font-bold outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer" required>
                <option value="">Tỉnh/Thành</option>
                {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
              </select>
              <select value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} className="bg-slate-50 border-none rounded-xl py-3 px-3 text-xs font-bold outline-none disabled:opacity-50 cursor-pointer" required>
                <option value="">Quận/Huyện</option>
                {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
              <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} className="bg-slate-50 border-none rounded-xl py-3 px-3 text-xs font-bold outline-none disabled:opacity-50 cursor-pointer" required>
                <option value="">Phường/Xã</option>
                {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
              </select>
            </div>
            <input type="text" placeholder="Số nhà, tên đường..." value={detailAddress} onChange={(e) => setDetailAddress(e.target.value)} className="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20" required />
          </div>

          <div className="pt-4 flex gap-4">
             <button type="button" onClick={() => window.history.back()} className="flex-1 py-4.5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition active:scale-95">Quay lại</button>
             <button type="submit" className="flex-[2] py-4.5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition active:scale-95">Lưu hồ sơ</button>
          </div>
        </form>
      </div>
    </div>
  );
}