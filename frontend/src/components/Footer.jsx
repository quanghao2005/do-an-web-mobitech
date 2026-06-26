import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function Footer() {
  const [storeInfo, setStoreInfo] = useState({
    STORE_PHONE: "1900 6688",
    STORE_EMAIL: "support@mobitech.vn",
    STORE_ADDRESS: "Cần Thơ, Việt Nam",
    STORE_FB: "#"
  });

  useEffect(() => {
    axios.get("http://localhost:8080/api/settings")
      .then(res => {
        const data = res.data;
        const info = { ...storeInfo };
        data.forEach(item => {
           if (item.keyName === 'STORE_PHONE') info.STORE_PHONE = item.valueContent;
           if (item.keyName === 'STORE_EMAIL') info.STORE_EMAIL = item.valueContent;
           if (item.keyName === 'STORE_ADDRESS') info.STORE_ADDRESS = item.valueContent;
           if (item.keyName === 'STORE_FB') info.STORE_FB = item.valueContent;
        });
        setStoreInfo(info);
      })
      .catch(err => console.error("Lỗi lấy thông tin cửa hàng:", err));
  }, []);

  return (
    <footer className="bg-white mt-20 border-t border-slate-100 rounded-t-[4rem] shadow-[0_-20px_50px_rgba(0,0,0,0.02)] italic">
      <div className="max-w-7xl mx-auto px-10 py-16 italic">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          
          {/* CỘT 1: GIỚI THIỆU */}
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-2xl font-black text-blue-600 tracking-tighter mb-6 uppercase">MOBITECH</h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Hệ thống bán lẻ điện thoại cao cấp. Cam kết chất lượng dịch vụ và sản phẩm hàng đầu Việt Nam.
            </p>
          </div>

          {/* CỘT 2: HỖ TRỢ KHÁCH HÀNG */}
          <div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Hỗ trợ</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500">
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Chính sách bảo hành</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Hình thức thanh toán</li>
              <li className="hover:text-blue-600 cursor-pointer transition-colors">Vận chuyển & Giao nhận</li>
            </ul>
          </div>

          {/* CỘT 3: LIÊN HỆ NHANH */}
          <div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Liên hệ</h4>
            <ul className="space-y-4 text-sm font-bold text-slate-500 italic">
              <li>📞 Hotline: {storeInfo.STORE_PHONE}</li>
              <li>📧 Email: {storeInfo.STORE_EMAIL}</li>
              <li>📍 Địa chỉ: {storeInfo.STORE_ADDRESS}</li>
            </ul>
          </div>

          {/* CỘT 4: MẠNG XÃ HỘI (THEO YÊU CẦU CỦA BẠN) */}
          <div>
            <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6">Kết nối với chúng tôi</h4>
            <div className="flex gap-4 italic">
              {/* FACEBOOK */}
              <a href={storeInfo.STORE_FB} target="_blank" rel="noreferrer" className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                <i className="fab fa-facebook-f">FB</i>
              </a>
              {/* INSTAGRAM */}
              <a href="#" className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                <i className="fab fa-instagram"></i>
              </a>
              {/* ZALO */}
              <a href="#" className="w-12 h-12 bg-blue-100 text-blue-800 rounded-2xl flex items-center justify-center hover:bg-blue-800 hover:text-white transition-all shadow-sm font-black text-[10px]">
                ZALO
              </a>
            </div>
            <p className="text-[9px] text-slate-400 font-bold uppercase mt-6 tracking-widest">Phục vụ 24/7</p>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-slate-50 text-center">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">
            © 2026 MOBITECH STORE - SMARTPHONE RETAIL SYSTEM
          </p>
        </div>
      </div>
    </footer>
  );
}