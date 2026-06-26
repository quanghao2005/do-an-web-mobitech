import { useState, useEffect } from 'react';
import axios from 'axios';

export default function WelcomePopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [promo, setPromo] = useState(null); // State để lưu dữ liệu mã lấy từ Admin

  useEffect(() => {
    // 1. Kiểm tra xem khách đã đăng nhập chưa
    const user = localStorage.getItem('user');
    if (!user) return; // Nếu chưa đăng nhập thì KHÔNG hiện popup gì cả

    // 2. Nếu đã đăng nhập, kiểm tra xem đã từng xem popup chưa
    const hasSeenPopup = localStorage.getItem('seenWelcomePromo');
    
    if (!hasSeenPopup) {
      axios.get('http://localhost:8080/api/promotions')
        .then(res => {
          const now = new Date();
          const activePromos = res.data.filter(p => p.status === 1 && p.isPublic === 1 && new Date(p.endDate) >= now);
          if (activePromos.length > 0) {
            setPromo(activePromos[0]);
            const timer = setTimeout(() => {
              setIsOpen(true);
            }, 2000);
            return () => clearTimeout(timer);
          }
        })
        .catch(err => console.error("Lỗi tải popup:", err));
    }
  }, []); // useEffect này chạy 1 lần khi trang được load

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('seenWelcomePromo', 'true');
  };

  const handleCopyCode = () => {
    if (promo) {
      navigator.clipboard.writeText(promo.code);
      
      // Lưu vào kho voucher của user
      const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
      if (!saved.includes(promo.code)) {
        saved.push(promo.code);
        localStorage.setItem('savedVouchers', JSON.stringify(saved));
      }

      alert(`Đã lưu mã ${promo.code} vào Kho Voucher của bạn!`);
      handleClose();
    }
  };

  // Nếu chưa bật hoặc không có mã nào thì không hiển thị gì cả
  if (!isOpen || !promo) return null;

  // Xử lý text hiển thị cho linh hoạt (Phần trăm hoặc Số tiền)
  const discountText = promo.discountType === 'PERCENT' 
    ? `Giảm ngay ${promo.discountValue}%` 
    : `Giảm ngay ${promo.discountValue.toLocaleString()}đ`;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100] animate-fadeIn italic font-sans">
      <div className="bg-white rounded-[3rem] w-full max-w-md p-10 text-center relative shadow-2xl overflow-hidden transform scale-100 transition-transform">
        
        {/* Nút tắt */}
        <button onClick={handleClose} className="absolute top-6 right-6 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-400 hover:bg-red-500 hover:text-white transition-all">✕</button>
        
        {/* Nội dung Popup */}
        <div className="text-6xl mb-6">🎁</div>
        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-2">Chào bạn mới!</h3>
        <p className="text-sm font-bold text-slate-500 mb-8">Tặng ngay voucher giảm giá cho đơn hàng trải nghiệm mua sắm đầu tiên.</p>
        
        <div className="bg-red-50 border border-red-100 p-6 rounded-3xl mb-8 relative border-dashed">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-400 absolute -top-3 left-1/2 -translate-x-1/2 bg-red-50 px-4">Mã của bạn</span>
            
            {/* IN MÃ TỪ BACKEND RA ĐÂY */}
            <p className="text-4xl font-black text-red-600 tracking-widest">{promo.code}</p>
            
            {/* IN ĐIỀU KIỆN MÃ TỪ BACKEND RA ĐÂY */}
            <p className="text-[10px] text-red-400 font-bold mt-2 uppercase">
              {discountText} {promo.minOrderValue > 0 && `(Cho đơn từ ${promo.minOrderValue.toLocaleString()}đ)`}
            </p>
        </div>

        <button onClick={handleCopyCode} className="w-full bg-slate-900 text-white py-5 rounded-[2rem] font-black uppercase text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95 tracking-widest">
            Copy mã & Mua sắm ngay
        </button>
      </div>
    </div>
  );
}