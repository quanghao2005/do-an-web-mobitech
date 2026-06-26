import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminSetting() {
  const [settings, setSettings] = useState({
    STORE_PHONE: "",
    STORE_EMAIL: "",
    STORE_ADDRESS: "",
    STORE_FB: "",
    BANK_NAME: "",
    BANK_ACC: "",
    BANK_OWNER: "",
    MOMO_ACC: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/settings");
      const data = res.data;
      
      const newSettings = { ...settings };
      data.forEach((item) => {
        if (newSettings[item.keyName] !== undefined) {
          newSettings[item.keyName] = item.valueContent;
        }
      });
      setSettings(newSettings);
    } catch (err) {
      console.error("Lỗi tải cài đặt:", err);
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Convert object to array of SettingDTO
      const payload = Object.keys(settings).map((key) => ({
        keyName: key,
        valueContent: settings[key]
      }));

      await axios.put("http://localhost:8080/api/settings", payload);
      alert("✅ Lưu cài đặt thành công!");
    } catch (err) {
      console.error("Lỗi lưu cài đặt:", err);
      alert("❌ Có lỗi xảy ra khi lưu cài đặt.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 font-sans italic">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Cài đặt Hệ thống</h2>
          <p className="text-slate-400 text-sm mt-1 font-bold italic">Cấu hình thông tin động cho toàn bộ Website</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 italic"
        >
          {isLoading ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 italic">
        
        {/* CỘT 1: THÔNG TIN CỬA HÀNG */}
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 italic">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
            <span className="text-blue-500 text-2xl">🏪</span> Thông tin Cửa hàng
          </h3>
          
          <div className="space-y-4 italic">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Số điện thoại Hotline</label>
              <input 
                type="text" 
                value={settings.STORE_PHONE}
                onChange={(e) => handleChange("STORE_PHONE", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: 0987654321"
              />
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Email liên hệ</label>
              <input 
                type="text" 
                value={settings.STORE_EMAIL}
                onChange={(e) => handleChange("STORE_EMAIL", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: contact@mobitech.com"
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Địa chỉ cửa hàng</label>
              <input 
                type="text" 
                value={settings.STORE_ADDRESS}
                onChange={(e) => handleChange("STORE_ADDRESS", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: 123 Đường ABC, Quận X..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Link Facebook (Fanpage)</label>
              <input 
                type="text" 
                value={settings.STORE_FB}
                onChange={(e) => handleChange("STORE_FB", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: https://facebook.com/..."
              />
            </div>
          </div>
        </div>

        {/* CỘT 2: THÔNG TIN THANH TOÁN */}
        <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 italic">
          <h3 className="text-lg font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2 italic">
            <span className="text-green-500 text-2xl">💳</span> Thông tin Thanh toán QR
          </h3>
          
          <div className="space-y-4 italic">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Ngân hàng (Tên viết tắt hoặc BIN)</label>
              <input 
                type="text" 
                value={settings.BANK_NAME}
                onChange={(e) => handleChange("BANK_NAME", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: MB, VCB, ACB, TPB..."
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-1 italic">Để API tạo ảnh QR chạy đúng, hãy nhập mã ngân hàng như: MB, VCB, Vietinbank...</p>
            </div>
            
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Số tài khoản</label>
              <input 
                type="text" 
                value={settings.BANK_ACC}
                onChange={(e) => handleChange("BANK_ACC", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="Nhập số tài khoản..."
              />
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1 italic">Tên người thụ hưởng (Viết không dấu)</label>
              <input 
                type="text" 
                value={settings.BANK_OWNER}
                onChange={(e) => handleChange("BANK_OWNER", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all italic"
                placeholder="VD: NGUYEN VAN A"
              />
            </div>

            <div className="pt-4 border-t border-blue-100 mt-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-pink-500 ml-1 italic">Số điện thoại / TK MoMo</label>
              <input 
                type="text" 
                value={settings.MOMO_ACC}
                onChange={(e) => handleChange("MOMO_ACC", e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-white border border-pink-200 rounded-xl font-bold text-sm outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all italic"
                placeholder="VD: 0987654321 hoặc PSP..."
              />
              <p className="text-[10px] text-slate-400 mt-1 ml-1 italic">Dành cho khách hàng chọn thanh toán qua ví MoMo</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}