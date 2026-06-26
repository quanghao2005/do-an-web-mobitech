import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // 1. State quản lý thông tin hiển thị
 const [formData, setFormData] = useState({
  fullName: localStorage.getItem("fullName") || "Người dùng",
  avatar: localStorage.getItem("avatar") || "",
});
  const syncUserInfo = () => {
    setFormData({
      fullName: localStorage.getItem("fullName") || "Người dùng",
      avatar: localStorage.getItem("avatar") || "",
    });
  };

  // 2. Hiệu ứng đồng bộ
  useEffect(() => {
    syncUserInfo();

    window.addEventListener("storage", syncUserInfo);
    window.addEventListener("profileUpdated", syncUserInfo);

    return () => {
      window.removeEventListener("storage", syncUserInfo);
      window.removeEventListener("profileUpdated", syncUserInfo);
    };
  }, [location]);

  const handleSearch = (e) => {
    if (e.key === "Enter" && searchTerm.trim() !== "") {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm("");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi hệ thống?")) {
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm py-4 px-8 flex justify-between items-center sticky top-0 z-50 border-b border-slate-100 font-sans italic">
      {/* LOGO */}
      <Link to="/" className="text-2xl font-black text-blue-600 tracking-tighter hover:opacity-80 transition italic">
        MOBITECH
      </Link>

      {/* THANH TÌM KIẾM */}
      <div className="flex-1 max-w-md mx-10">
        <div className="relative group">
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)} 
            onKeyDown={handleSearch}
            placeholder="Tìm tên điện thoại, hãng..." 
            className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-2.5 px-5 pl-12 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none font-bold italic"
          />
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>
        </div>
      </div>

      <div className="flex items-center gap-5">
        {/* NÚT ADMIN */}
        {token && role === "ADMIN" && (
          <Link to="/admin" className="hidden lg:block text-[10px] font-black text-blue-600 bg-blue-50 px-4 py-2.5 rounded-xl uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all italic">
            Quản trị
          </Link>
        )}

        {/* GIỎ HÀNG */}
        <Link to="/cart" className="relative p-2 hover:bg-slate-50 rounded-xl transition-colors group">
          <span className="text-2xl group-hover:scale-110 transition-transform inline-block">🛒</span>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white animate-bounce italic">
              {cartCount}
            </span>
          )}
        </Link>
        <Link to="/promotions" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-black italic uppercase text-[11px] tracking-widest transition-all">
          <span className="text-lg">🎟️</span> Khuyến mãi
        </Link>
        <Link to="/blog" className="flex items-center gap-2 text-slate-600 hover:text-blue-600 font-black italic uppercase text-[11px] tracking-widest transition-all">
          <span className="text-lg">📰</span> Tin tức
        </Link>

        {/* NGƯỜI DÙNG */}
        {token ? (
          <div className="relative">
            <button 
              onClick={() => setShowProfile(!showProfile)}
              className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-200 hover:ring-4 hover:ring-blue-100 transition-all shadow-lg active:scale-90 bg-white"
            >
              {formData.avatar ? (
                <img 
                  key={formData.avatar} 
                  src={formData.avatar} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="w-full h-full bg-slate-900 text-white flex items-center justify-center font-bold italic">
                  {formData.fullName.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            {showProfile && (
              <>
                <div className="fixed inset-0 z-[-1]" onClick={() => setShowProfile(false)}></div>
                
                <div className="absolute right-0 mt-4 w-72 bg-white rounded-[3rem] shadow-2xl border border-slate-50 p-8 animate-slideUp italic">
                  <div className="text-center mb-6 italic">
                    <div className="w-20 h-20 mx-auto mb-3 rounded-full overflow-hidden border-4 border-white shadow-lg ring-2 ring-blue-50 italic">
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center text-2xl font-black italic">
                          {formData.fullName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tight truncate italic">
                      {formData.fullName}
                    </h3>
                    
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2 italic">
                      Thành viên Mobitech
                    </p>
                  </div>

                  <div className="space-y-3 italic">
                    {/* 1. LỊCH SỬ ĐƠN HÀNG */}
                    <button 
                      onClick={() => { navigate("/order-history"); setShowProfile(false); }}
                      className="w-full py-4 bg-blue-50 text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all active:scale-95 italic"
                    >
                      📜 Lịch sử đơn hàng
                    </button>

                    {/* SẢN PHẨM YÊU THÍCH */}
                    <button 
                      onClick={() => { navigate("/wishlist"); setShowProfile(false); }}
                      className="w-full py-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-pink-600 hover:text-white transition-all active:scale-95 italic"
                    >
                      ❤️ Sản phẩm yêu thích
                    </button>

                    {/* 2. HỖ TRỢ ADMIN (MỚI THÊM) */}
                    <button 
                      onClick={() => { navigate("/contact"); setShowProfile(false); }}
                      className="w-full py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 italic"
                    >
                      🎧 Hỗ trợ trực tuyến
                    </button>

                    {/* 3. CẬP NHẬT HỒ SƠ */}
                    <button 
                      onClick={() => { navigate("/profile"); setShowProfile(false); }}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-lg active:scale-95 italic"
                    >
                      Cập nhật hồ sơ
                    </button>

                    {/* 4. ĐĂNG XUẤT */}
                    <button 
                      onClick={handleLogout}
                      className="w-full py-3 text-red-500 font-black text-[10px] hover:bg-red-50 rounded-2xl transition-all uppercase tracking-widest italic"
                    >
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-2xl font-black text-xs uppercase hover:bg-blue-700 transition shadow-lg shadow-blue-200 active:scale-95 italic">
            Đăng nhập
          </Link>
        )}
      </div>
    </nav>
  );
}