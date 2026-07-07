import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // Fetch all products for search
  useEffect(() => {
    axios.get("http://localhost:8080/api/products/active")
      .then(res => setAllProducts(res.data))
      .catch(err => console.log("Lỗi tải sản phẩm search", err));
  }, []);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchResults = allProducts
    .filter(p => searchTerm && p.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .slice(0, 5);

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
      setShowSuggestions(false);
      setSearchTerm("");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Bạn muốn đăng xuất khỏi hệ thống?")) {
      // Chỉ xóa các thông tin đăng nhập, giữ lại dữ liệu giỏ hàng
      const keysToRemove = ['token', 'role', 'userId', 'username', 'fullName', 'avatar', 'phone', 'address', 'user'];
      keysToRemove.forEach(key => localStorage.removeItem(key));
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
        <div className="relative group" ref={searchRef}>
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowSuggestions(true);
            }} 
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleSearch}
            placeholder="Tìm tên điện thoại, hãng..." 
            className="w-full bg-slate-100 border-2 border-transparent rounded-2xl py-2.5 px-5 pl-12 text-sm focus:bg-white focus:border-blue-500 transition-all outline-none font-bold italic"
          />
          <span className="absolute left-4 top-3 text-slate-400">🔍</span>

          {/* DROPDOWN KẾT QUẢ TÌM KIẾM */}
          {showSuggestions && searchTerm && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50">
              {searchResults.length > 0 ? (
                <div className="max-h-[300px] overflow-y-auto">
                  {searchResults.map((product) => (
                    <div 
                      key={product.id}
                      onClick={() => {
                        navigate(`/product/${product.id}`);
                        setShowSuggestions(false);
                        setSearchTerm("");
                      }}
                      className="flex items-center gap-4 p-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-xl shadow-sm" />
                      <div className="flex-1">
                        <h4 className="text-xs font-black text-slate-800 uppercase italic truncate">{product.name}</h4>
                        <p className="text-blue-600 font-black text-[10px] italic">{product.price?.toLocaleString()}đ</p>
                      </div>
                    </div>
                  ))}
                  <div 
                    onClick={() => {
                      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
                      setShowSuggestions(false);
                      setSearchTerm("");
                    }}
                    className="p-3 text-center bg-slate-50 hover:bg-blue-50 text-blue-600 font-black text-[10px] uppercase cursor-pointer italic transition-colors"
                  >
                    Xem tất cả kết quả
                  </div>
                </div>
              ) : (
                <div className="p-4 text-center text-slate-400 text-xs font-bold italic">
                  Không tìm thấy sản phẩm "{searchTerm}"
                </div>
              )}
            </div>
          )}
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