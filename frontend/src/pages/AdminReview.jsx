import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminReview() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

const fetchReviews = async () => {
  try {
    const res = await axios.get("http://localhost:8080/api/reviews");
    setReviews(res.data);
    setLoading(false);
  } catch (err) {
    console.error("Lỗi tải đánh giá:", err);
    setLoading(false);
  }
};

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này không?")) {
      try {
        await axios.delete(`http://localhost:8080/api/reviews/${id}`);
        setReviews(reviews.filter((r) => r.id !== id));
      } catch (err) {
        alert("Xóa thất bại!");
      }
    }
  };

  if (loading) return <div className="p-10 font-black text-blue-600">ĐANG TẢI...</div>;

  return (
    <div className="p-8 bg-slate-50 min-h-screen font-sans animate-fadeIn">
      <div className="mb-10">
        <h3 className="text-3xl font-black text-slate-800 uppercase tracking-tighter italic">Quản lý đánh giá</h3>
        <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Kiểm duyệt nội dung khách hàng</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.length > 0 ? (
          reviews.map((r) => (
            <div key={r.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex justify-between items-center group hover:shadow-md transition-all">
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-2">
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-[9px] font-black uppercase italic">
                    ID Sản phẩm: {r.productId}
                  </span>
                  <span className="text-[10px] font-black text-slate-800 uppercase tracking-tight">{r.user_fullName}</span>
                  <div className="flex text-[8px]">{Array(r.rating).fill("⭐")}</div>
                </div>
                <p className="text-slate-500 text-sm font-medium italic leading-relaxed">"{r.comment}"</p>
                <p className="text-[9px] text-slate-300 font-bold uppercase mt-2 italic">Ngày đăng: {new Date(r.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>

              <button 
                onClick={() => handleDelete(r.id)}
                className="w-12 h-12 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm active:scale-90"
                title="Xóa bình luận"
              >
                <span className="text-xl">🗑️</span>
              </button>
            </div>
          ))
        ) : (
          <div className="bg-white p-20 rounded-[3rem] text-center border-2 border-dashed border-slate-200">
             <p className="text-slate-300 font-black uppercase tracking-widest italic">Chưa có đánh giá nào để quản lý</p>
          </div>
        )}
      </div>
    </div>
  );
}