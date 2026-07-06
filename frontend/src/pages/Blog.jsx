import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function Blog() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [activeTopic, setActiveTopic] = useState("all");

  useEffect(() => {
    axios.get("http://localhost:8080/api/topics")
      .then(res => setTopics(res.data))
      .catch(err => console.error(err));

    axios.get("http://localhost:8080/api/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error(err));
      
    axios.get("http://localhost:8080/api/promotions")
      .then(res => setPromotions(res.data))
      .catch(err => console.error(err));
  }, []);

  const filteredPosts = posts.filter(post => {
    // 1. Lọc theo Topic
    if (activeTopic !== "all" && (!post.topic || post.topic.id !== activeTopic)) return false;

    // 2. Lọc ẩn bài viết có mã voucher đã HẾT HẠN
    if (post.content && promotions.length > 0) {
      const regex = /\[VOUCHER:\s*([A-Za-z0-9]+)\]/g;
      let match;
      while ((match = regex.exec(post.content)) !== null) {
        const code = match[1];
        const promo = promotions.find(p => p.code === code);
        if (promo) {
          // Kiểm tra xem promo có hết hạn, hết lượt hoặc bị tắt không
          if (new Date(promo.endDate) < new Date() || promo.status === 0 || promo.usedCount >= promo.usageLimit) {
            return false; // Ẩn luôn bài viết
          }
        }
      }
    }
    return true;
  });

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100 min-h-screen py-20 animate-fadeIn font-sans selection:bg-blue-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 relative">
          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-400/20 rounded-full blur-[100px] pointer-events-none"></div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            Tin tức Công nghệ
          </h1>
          <p className="text-slate-500 font-bold max-w-2xl mx-auto text-lg">Cập nhật nhanh nhất các thông tin về điện thoại, khuyến mãi và thủ thuật hay.</p>
        </div>

        {/* Lọc theo chủ đề */}
        <div className="flex flex-wrap justify-center gap-3 mb-20 relative z-10">
          <div className="bg-white/50 backdrop-blur-xl p-2 rounded-[2.5rem] shadow-sm border border-white/60 flex flex-wrap gap-2">
            <button 
              onClick={() => setActiveTopic("all")}
              className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTopic === "all" ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/20 scale-105' : 'bg-transparent text-slate-500 hover:text-slate-900 hover:bg-white/60'}`}
            >
              Tất cả
            </button>
            {topics.map(topic => (
              <button 
                key={topic.id}
                onClick={() => setActiveTopic(topic.id)}
                className={`px-8 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all duration-300 ${activeTopic === topic.id ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/30 scale-105' : 'bg-transparent text-slate-500 hover:text-blue-600 hover:bg-white/60'}`}
              >
                {topic.name}
              </button>
            ))}
          </div>
        </div>

        {/* Danh sách bài viết */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 auto-rows-fr">
          {filteredPosts.map((post, index) => {
            // Nổi bật bài viết đầu tiên nếu đang ở mục Tất cả
            const isFeatured = index === 0 && activeTopic === "all" && filteredPosts.length > 2;

            return (
              <Link to={`/blog/${post.id}`} key={post.id} className={`bg-white/80 backdrop-blur-md rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 border border-white flex flex-col group ${isFeatured ? 'md:col-span-2 lg:flex-row' : ''}`}>
                <div className={`${isFeatured ? 'lg:w-1/2 lg:h-auto h-72' : 'h-64'} relative overflow-hidden bg-slate-100`}>
                  {post.imageUrl ? (
                    <img src={post.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" alt={post.title} />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-100 via-purple-50 to-blue-100 flex flex-col items-center justify-center text-indigo-300 font-bold group-hover:scale-105 transition-transform duration-700">
                      <span className="text-6xl mb-2 opacity-50">📰</span>
                      <span className="uppercase text-[10px] tracking-widest font-black">No Image</span>
                    </div>
                  )}
                  {post.topic && (
                    <div className="absolute top-6 left-6 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-2xl text-[10px] font-black text-blue-600 uppercase tracking-widest shadow-lg">
                      {post.topic.name}
                    </div>
                  )}
                </div>
                <div className={`p-8 lg:p-10 flex-1 flex flex-col justify-between ${isFeatured ? 'lg:w-1/2' : ''}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">3 Phút đọc</span>
                    </div>
                    <h3 className={`${isFeatured ? 'text-3xl' : 'text-xl'} font-black text-slate-800 leading-tight mb-4 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-purple-600 transition-all line-clamp-3`}>
                      {post.title}
                    </h3>
                    <p className={`text-slate-500 font-medium ${isFeatured ? 'line-clamp-4' : 'line-clamp-3'} mb-8`}>{post.content}</p>
                  </div>
                  
                  <div className="flex items-center justify-between pt-6 border-t border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-purple-100 flex items-center justify-center text-xs font-black text-blue-600 shadow-sm border border-white">
                        {post.author ? post.author.username?.charAt(0).toUpperCase() : 'A'}
                      </div>
                      <div>
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">{post.author ? post.author.username : 'Admin'}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tác giả</p>
                      </div>
                    </div>
                    <span className="w-12 h-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white group-hover:scale-110 group-hover:rotate-[-45deg] transition-all duration-300 shadow-sm">
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
          {filteredPosts.length === 0 && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-black uppercase tracking-widest">Không có bài viết nào trong chủ đề này.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
