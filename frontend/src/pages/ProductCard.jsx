import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ProductCard = ({ product, initialIsWished = false, onWishlistChange }) => {
  const navigate = useNavigate();
  const [isWished, setIsWished] = useState(initialIsWished); 

  // Đồng bộ state khi prop thay đổi (cần thiết nếu component cha load dữ liệu sau)
  React.useEffect(() => {
    setIsWished(initialIsWished);
  }, [initialIsWished]);

  const handleWishlist = async (e) => {
    e.stopPropagation(); 
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích!");
      navigate("/login");
      return;
    }
    
    try {
      const token = localStorage.getItem("token");
      if (isWished) {
        await axios.delete(`http://localhost:8080/api/wishlists/user/${userId}/product/${product.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWished(false);
        if (onWishlistChange) onWishlistChange(product.id, false);
      } else {
        await axios.post(`http://localhost:8080/api/wishlists/user/${userId}/product/${product.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsWished(true);
        alert("Đã thêm vào danh sách yêu thích!");
        if (onWishlistChange) onWishlistChange(product.id, true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 1. Kiểm tra điều kiện giảm giá: oldPrice phải tồn tại và lớn hơn giá hiện tại
  const isSale = product && product.oldPrice && product.oldPrice > product.price;
  
  // 2. Tính toán % giảm giá chính xác
  const discountPercent = isSale 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100) 
    : 0;

  return (
    <div 
      onClick={() => navigate(`/product/${product.id}`)}
      className="bg-white rounded-[3.5rem] p-8 shadow-sm hover:shadow-2xl hover:-translate-y-4 transition-all duration-500 border border-transparent hover:border-blue-100 group relative cursor-pointer flex flex-col h-full italic"
    >
      {/* TAG GIẢM GIÁ GÓC TRÁI (Tạo điểm nhấn giống các sàn TMĐT) */}
      {isSale && (
        <div className="absolute top-6 left-6 z-10 bg-red-500 text-white text-[10px] font-black px-4 py-2 rounded-2xl shadow-xl shadow-red-200 uppercase italic">
          Giảm {discountPercent}%
        </div>
      )}

      {/* NÚT YÊU THÍCH GÓC PHẢI */}
      <button 
        onClick={handleWishlist}
        className={`absolute top-6 right-6 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md ${isWished ? 'bg-red-50 text-red-500' : 'bg-white text-slate-300 hover:text-red-500'}`}
      >
        <span className="text-xl leading-none">{isWished ? '❤️' : '🤍'}</span>
      </button>

      {/* ẢNH SẢN PHẨM */}
      <div className="h-60 mb-8 overflow-hidden rounded-[2.5rem] bg-slate-50 flex items-center justify-center p-8 relative shadow-inner">
         <img 
            src={product.imageUrl || 'https://via.placeholder.com/300'} 
            className="max-h-full object-contain transition-all duration-700 group-hover:scale-110 drop-shadow-2xl" 
            alt={product.name}
         />
      </div>

      {/* THÔNG TIN SẢN PHẨM */}
      <div className="flex-1 space-y-2 text-center">
        <h3 className="font-black text-slate-800 text-lg leading-tight uppercase tracking-tighter group-hover:text-blue-600 transition-colors italic">
          {product.name}
        </h3>
        
        {/* KHỐI GIÁ TIỀN */}
        <div className="mt-4 flex flex-col items-center gap-1">
          {/* Giá hiện tại */}
          <p className="text-red-600 font-black text-2xl italic">
            {product.price?.toLocaleString()}đ
          </p>
          
          {/* Giá cũ & Phần trăm giảm giá */}
          {isSale ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-400 text-sm line-through italic font-bold">
                {product.oldPrice?.toLocaleString()}đ
              </span>
              <span className="text-red-500 text-sm font-black italic">
                -{discountPercent}%
              </span>
            </div>
          ) : (
            /* Giữ chỗ trống để layout không bị nhảy khi có/không có sale */
            <div className="h-5"></div>
          )}
        </div>
      </div>

      {/* NÚT MUA NGAY */}
      <button className="w-full mt-8 bg-blue-600 text-white py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all duration-500 italic">
        Mua ngay
      </button>
    </div>
  );
};

export default ProductCard;