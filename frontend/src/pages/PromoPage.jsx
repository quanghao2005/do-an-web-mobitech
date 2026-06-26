import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function PromoPage() {
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inputCode, setInputCode] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const navigate = useNavigate();
  const user = localStorage.getItem('user');

  useEffect(() => {
    // NẾU CHƯA ĐĂNG NHẬP -> Đẩy khách sang trang Login
    if (!user) {
      alert("Vui lòng đăng nhập để xem và săn Voucher độc quyền!");
      navigate("/login");
      return;
    }

    // Nếu đã đăng nhập thì mới gọi API lấy mã
    axios.get('http://localhost:8080/api/promotions')
      .then(res => {
        const now = new Date();
        const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
        
        // LỌC: Mã Đang chạy VÀ chưa hết hạn VÀ đã được lưu trong kho của khách
        const myPromos = res.data.filter(p => 
            p.status === 1 && 
            new Date(p.endDate) >= now && 
            saved.includes(p.code)
        );
        setPromos(myPromos);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [user, navigate]);

  const handleSaveCode = async () => {
    if (!inputCode.trim()) return;
    
    setSaveMessage('Đang kiểm tra mã...');
    try {
      // Tải lại toàn bộ mã để check (Kể cả mã ẩn isPublic=0 nhưng admin đã cho khách trong bài viết)
      const res = await axios.get('http://localhost:8080/api/promotions');
      const now = new Date();
      const validPromo = res.data.find(p => p.code.toUpperCase() === inputCode.trim().toUpperCase() && p.status === 1 && new Date(p.endDate) >= now);

      if (validPromo) {
        const saved = JSON.parse(localStorage.getItem('savedVouchers') || '[]');
        if (saved.includes(validPromo.code)) {
            setSaveMessage('Mã này đã có trong kho của bạn rồi!');
        } else {
            saved.push(validPromo.code);
            localStorage.setItem('savedVouchers', JSON.stringify(saved));
            setPromos(prev => [...prev, validPromo]);
            setSaveMessage('Đã lưu mã thành công!');
            setInputCode('');
        }
      } else {
        setSaveMessage('Mã không hợp lệ hoặc đã hết hạn!');
      }
    } catch (err) {
      setSaveMessage('Lỗi kết nối máy chủ!');
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    alert(`Đã copy mã ${code} để sử dụng!`);
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-16 px-6 font-sans italic">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-slate-900 tracking-tighter uppercase mb-4">Kho Voucher Của Bạn</h1>
            <p className="text-slate-500 font-bold">Các mã giảm giá bạn đã săn được sẽ nằm ở đây</p>
        </div>

        {/* Khu vực Săn Mã / Nhập mã */}
        <div className="max-w-2xl mx-auto mb-16 bg-white p-6 rounded-[2rem] shadow-lg border border-slate-100 flex flex-col sm:flex-row gap-4 items-center">
            <input 
                type="text" 
                value={inputCode}
                onChange={e => setInputCode(e.target.value.toUpperCase())}
                placeholder="NHẬP MÃ BẠN SĂN ĐƯỢC TỪ BÀI VIẾT..." 
                className="flex-1 w-full bg-slate-50 p-4 rounded-2xl font-black uppercase outline-none border border-slate-100 text-sm focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <button 
                onClick={handleSaveCode}
                className="w-full sm:w-auto bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-all shadow-xl shadow-blue-200 active:scale-95"
            >
                LƯU VÀO KHO
            </button>
        </div>
        {saveMessage && (
            <p className={`text-center font-black uppercase text-xs tracking-widest mb-10 ${saveMessage.includes('thành công') ? 'text-green-500' : 'text-red-500'}`}>
                {saveMessage}
            </p>
        )}

        {loading ? (
            <div className="text-center font-black uppercase text-slate-400 text-xs tracking-widest">Đang tải mã giảm giá...</div>
        ) : promos.length === 0 ? (
            <div className="text-center bg-white p-20 rounded-[3rem] shadow-sm">
                <span className="text-6xl">🥲</span>
                <p className="text-slate-400 font-bold mt-6 uppercase text-sm tracking-widest">Hiện tại chưa có mã giảm giá nào</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {promos.map(promo => {
                // Tính toán phần trăm đã sử dụng cho thanh Progress bar
                const usedPercent = Math.min((promo.usedCount / promo.usageLimit) * 100, 100);
                const isOutOfStock = promo.usedCount >= promo.usageLimit;

                return (
                  // THIẾT KẾ DẠNG TẤM VÉ (TICKET)
                  <div key={promo.id} className={`flex rounded-[2rem] shadow-md border overflow-hidden transition-all hover:-translate-y-1 ${isOutOfStock ? 'bg-slate-50 border-slate-200 opacity-70' : 'bg-white border-blue-100 hover:shadow-xl hover:shadow-blue-900/5'}`}>
                    
                    {/* Phần Icon bên trái */}
                    <div className={`w-1/4 flex flex-col items-center justify-center border-r border-dashed ${isOutOfStock ? 'bg-slate-200 border-slate-300' : 'bg-blue-50 border-blue-200'} p-4 relative`}>
                        {/* Hình bán nguyệt tạo hiệu ứng rách vé */}
                        <div className="absolute -top-3 -right-3 w-6 h-6 bg-[#f8f9fa] rounded-full"></div>
                        <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-[#f8f9fa] rounded-full"></div>
                        
                        <span className={`text-3xl ${isOutOfStock ? 'grayscale' : ''}`}>🎟️</span>
                    </div>

                    {/* Phần nội dung bên phải */}
                    <div className="w-3/4 p-6 flex flex-col justify-between relative">
                        <div>
                            <h3 className="font-black text-slate-800 uppercase tracking-tighter leading-tight line-clamp-1">{promo.name}</h3>
                            <p className={`font-black text-2xl mt-1 ${isOutOfStock ? 'text-slate-400' : 'text-blue-600'}`}>
                                {promo.discountType === 'PERCENT' ? `GIẢM ${promo.discountValue}%` : `GIẢM ${promo.discountValue?.toLocaleString()}Đ`}
                            </p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-2">
                                Đơn tối thiểu {promo.minOrderValue?.toLocaleString()}đ
                            </p>
                        </div>

                        <div className="mt-6 flex items-end justify-between gap-4">
                            {/* Thanh Progress Bar */}
                            <div className="flex-1">
                                <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 mb-1">
                                    <span>Đã dùng</span>
                                    <span>{promo.usedCount}/{promo.usageLimit}</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full transition-all duration-1000 ${isOutOfStock ? 'bg-slate-400' : usedPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                                        style={{ width: `${usedPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            <button 
                                onClick={() => handleCopy(promo.code)}
                                disabled={isOutOfStock}
                                className={`px-4 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isOutOfStock ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:bg-slate-900 active:scale-95'}`}
                            >
                                {isOutOfStock ? 'Hết mã' : 'Sử dụng ngay'}
                            </button>
                        </div>
                    </div>
                  </div>
                );
              })}
            </div>
        )}
      </div>
    </div>
  );
}