import { useState, useEffect } from "react";
import axios from "axios";
import ProductCard from "./ProductCard";

export default function Wishlist() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!userId || !token) {
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:8080/api/wishlists/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => setWishlists(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId, token]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Đang tải...</div>;
  }

  if (!userId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] font-sans text-center">
        <h2 className="text-3xl font-black text-slate-800 uppercase tracking-tighter mb-4">Bạn chưa đăng nhập</h2>
        <p className="text-slate-500 font-bold mb-8">Vui lòng đăng nhập để xem danh sách sản phẩm yêu thích.</p>
        <a href="/login" className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs">Đăng nhập ngay</a>
      </div>
    );
  }

  return (
    <div className="bg-[#f8fafc] min-h-screen py-20 animate-fadeIn font-sans">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-4 mb-12">
            <div className="w-16 h-16 bg-red-100 text-red-500 rounded-[2rem] flex items-center justify-center text-3xl shadow-inner">
                ❤️
            </div>
            <div>
                <h1 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Sản phẩm yêu thích</h1>
                <p className="text-slate-400 font-bold text-sm mt-1">Danh sách các máy bạn đã thả tim</p>
            </div>
        </div>

        {wishlists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {wishlists.map(w => (
              <ProductCard 
                key={w.id} 
                product={w.product} 
                initialIsWished={true}
                onWishlistChange={(productId, isWishedNow) => {
                  if (!isWishedNow) {
                    setWishlists(prev => prev.filter(item => item.product.id !== productId));
                  }
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white p-20 rounded-[4rem] text-center shadow-sm border border-slate-50 flex flex-col items-center">
            <span className="text-6xl mb-6">💔</span>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Chưa có sản phẩm nào</h2>
            <p className="text-slate-400 font-bold">Hãy dạo một vòng và thả tim cho chiếc điện thoại bạn thích nhé!</p>
            <a href="/" className="mt-8 bg-slate-900 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs hover:bg-blue-600 transition-colors">
                Khám phá ngay
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
