import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminPost() {
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [newPost, setNewPost] = useState({ title: "", content: "", imageUrl: "", topicId: "" });
  const [editingPost, setEditingPost] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage

  const fetchPosts = () => {
    axios.get("http://localhost:8080/api/posts")
      .then(res => setPosts(res.data))
      .catch(err => console.error("Lỗi lấy bài viết:", err));
  };

  const fetchTopics = () => {
    axios.get("http://localhost:8080/api/topics")
      .then(res => setTopics(res.data))
      .catch(err => console.error("Lỗi lấy chủ đề:", err));
  };

  useEffect(() => { 
    fetchPosts(); 
    fetchTopics();
  }, []);

  const handleSubmit = async (e) => {
    if(e) e.preventDefault(); 
    
    if (!newPost.title.trim() || !newPost.content.trim() || !newPost.topicId) {
      alert("Vui lòng nhập đầy đủ tiêu đề, nội dung và chọn chủ đề!");
      return;
    }

    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const selectedTopic = topics.find(t => t.id === parseInt(newPost.topicId));
      
      const data = { 
        title: newPost.title, 
        content: newPost.content, 
        imageUrl: newPost.imageUrl,
        topic: selectedTopic,
        author: { id: userId || 1 } // Giả sử user admin id = 1 nếu không có
      };

      if (editingPost) {
        await axios.put(`http://localhost:8080/api/posts/${editingPost.id}`, data, config);
        alert("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:8080/api/posts", data, config);
        alert("Thêm bài viết mới thành công!");
      }

      setEditingPost(null);
      setNewPost({ title: "", content: "", imageUrl: "", topicId: "" });
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác: " + (err.response?.data?.message || "Kiểm tra quyền Admin hoặc kết nối Server"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setNewPost({
        title: post.title,
        content: post.content,
        imageUrl: post.imageUrl || "",
        topicId: post.topic ? post.topic.id : ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa bài viết này?")) {
      axios.delete(`http://localhost:8080/api/posts/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert("Đã xóa bài viết.");
        fetchPosts();
      })
      .catch(err => alert("Không thể xóa bài viết này!"));
    }
  };

  return (
    <div className="p-8 animate-fadeIn font-sans">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Quản lý Bài viết</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Tin tức & Khuyến mãi</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-12 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all focus-within:shadow-xl focus-within:shadow-blue-100/50">
        <div className="grid grid-cols-2 gap-4">
            <input 
            value={newPost.title} 
            onChange={e => setNewPost({...newPost, title: e.target.value})}
            placeholder="Tiêu đề bài viết..." 
            className="col-span-2 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
            <input 
            value={newPost.imageUrl} 
            onChange={e => setNewPost({...newPost, imageUrl: e.target.value})}
            placeholder="Link ảnh Thumbnail" 
            className="bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
            <select
                value={newPost.topicId}
                onChange={e => setNewPost({...newPost, topicId: e.target.value})}
                className="bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            >
                <option value="">-- Chọn Chủ đề --</option>
                {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                ))}
            </select>
            <textarea 
            value={newPost.content} 
            onChange={e => setNewPost({...newPost, content: e.target.value})}
            placeholder="Nội dung bài viết (Hỗ trợ text hoặc HTML)..." 
            rows="6"
            className="col-span-2 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
            />
        </div>
        <div className="flex gap-4 mt-2">
            <button 
            type="submit"
            disabled={isLoading}
            className={`bg-blue-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
            >
            {isLoading ? "Đang lưu..." : editingPost ? "Cập nhật bài viết" : "Đăng bài viết"}
            </button>
            
            {editingPost && (
            <button 
                type="button"
                onClick={() => {setEditingPost(null); setNewPost({ title: "", content: "", imageUrl: "", topicId: "" });}} 
                className="px-6 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-xs uppercase hover:bg-slate-200 transition-colors"
            >
                Hủy
            </button>
            )}
        </div>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.length > 0 ? posts.map(post => (
          <div key={post.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex flex-col group hover:shadow-2xl hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100 overflow-hidden">
            <div className="h-40 bg-slate-100 rounded-2xl mb-4 overflow-hidden relative">
                {post.imageUrl ? (
                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold text-xs">No Image</div>
                )}
                <span className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600">
                    {post.topic?.name || "Uncategorized"}
                </span>
            </div>
            
            <h3 className="font-black text-slate-800 text-lg leading-tight mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-xs text-slate-400 font-bold line-clamp-2 mb-4 flex-1">{post.content}</p>
            
            <div className="flex justify-between items-center mt-auto pt-4 border-t border-slate-50">
              <span className="text-[10px] text-slate-400 font-bold">{new Date(post.createdAt).toLocaleDateString('vi-VN')}</span>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                <button 
                  onClick={() => handleEdit(post)} 
                  className="w-8 h-8 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                >
                  ✏️
                </button>
                <button 
                  onClick={() => handleDelete(post.id)} 
                  className="w-8 h-8 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Chưa có bài viết nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
}
