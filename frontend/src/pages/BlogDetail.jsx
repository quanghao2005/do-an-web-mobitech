import { useState, useEffect } from "react";
import axios from "axios";
import { useParams, Link } from "react-router-dom";

export default function BlogDetail() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [savedCodes, setSavedCodes] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    axios.get(`http://localhost:8080/api/posts/${id}`)
      .then(res => setPost(res.data))
      .catch(err => console.error(err));
    
    // Tải danh sách mã đã săn
    setSavedCodes(JSON.parse(localStorage.getItem('savedVouchers') || '[]'));
  }, [id]);

  if (!post) {
    return <div className="min-h-screen flex items-center justify-center font-black text-slate-400 uppercase tracking-widest">Đang tải bài viết...</div>;
  }

  const handleSaveVoucher = (code) => {
    if (!savedCodes.includes(code)) {
      const newSaved = [...savedCodes, code];
      setSavedCodes(newSaved);
      localStorage.setItem('savedVouchers', JSON.stringify(newSaved));
      alert(`Đã săn thành công mã! Hãy vào "Khuyến mãi" (Kho Voucher) để xem nhé.`);
    }
  };

  // Tự động tìm chuỗi [VOUCHER: XYZ] trong nội dung bài viết và biến thành nút bấm siêu đẹp
  const renderContent = (text) => {
    const regex = /\[VOUCHER:\s*([A-Za-z0-9]+)\]/g;
    const parts = text.split(regex);
    
    // Nếu không có mã voucher nào
    if (parts.length === 1) return <div className="prose prose-lg max-w-none text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{text}</div>;

    return (
      <div className="prose prose-lg max-w-none text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">
        {parts.map((part, index) => {
          // Các phần tử ở vị trí LẺ (1, 3, 5...) sẽ là MÃ VOUCHER do split bằng regex có capturing group
          if (index % 2 !== 0) {
            const isSaved = savedCodes.includes(part);
            
            if (isSaved) {
              return (
                <div key={index} className="inline-flex items-center gap-4 bg-slate-50 border border-slate-200 p-2 pl-6 rounded-full my-4 mx-2 shadow-sm opacity-70">
                  <span className="font-black text-slate-300 tracking-widest text-lg">*** ĐÃ ẨN ***</span>
                  <button 
                    disabled
                    className="bg-slate-300 text-white px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest cursor-not-allowed"
                  >
                    Đã Săn ✔️
                  </button>
                </div>
              );
            }

            return (
              <div key={index} className="inline-flex items-center gap-4 bg-red-50 border border-red-200 p-2 pl-6 rounded-full my-4 mx-2 shadow-sm">
                <span className="font-black text-red-600 tracking-widest text-lg">{part}</span>
                <button 
                  onClick={() => handleSaveVoucher(part)}
                  className="bg-red-500 text-white px-6 py-3 rounded-full font-black uppercase text-[10px] tracking-widest hover:bg-red-600 active:scale-95 transition-all shadow-md"
                >
                  Săn Mã Này 🎁
                </button>
              </div>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="bg-[#f8fafc] min-h-screen py-20 animate-fadeIn font-sans">
      <div className="max-w-4xl mx-auto px-6">
        <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors mb-10">
          ← Quay lại danh sách
        </Link>

        {post.topic && (
          <div className="mb-6 inline-block bg-blue-100 text-blue-600 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest">
            {post.topic.name}
          </div>
        )}

        <h1 className="text-4xl md:text-5xl font-black text-slate-800 leading-tight mb-8">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-12 pb-12 border-b border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-sm font-black text-slate-500">
            {post.author ? post.author.username?.charAt(0).toUpperCase() : 'A'}
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 uppercase">{post.author ? post.author.username : 'Administrator'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{new Date(post.createdAt).toLocaleDateString('vi-VN')} • Đăng lúc {new Date(post.createdAt).toLocaleTimeString('vi-VN')}</p>
          </div>
        </div>

        {post.imageUrl && (
          <div className="rounded-[3rem] overflow-hidden mb-12 shadow-2xl shadow-slate-200/50">
            <img src={post.imageUrl} className="w-full h-auto" alt={post.title} />
          </div>
        )}

        {renderContent(post.content)}
      </div>
    </div>
  );
}
