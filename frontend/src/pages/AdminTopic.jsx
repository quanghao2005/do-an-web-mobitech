import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminTopic() {
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState("");
  const [editingTopic, setEditingTopic] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchTopics = () => {
    axios.get("http://localhost:8080/api/topics")
      .then(res => setTopics(res.data))
      .catch(err => console.error("Lỗi lấy chủ đề:", err));
  };

  useEffect(() => { fetchTopics(); }, []);

  const handleSubmit = async (e) => {
    if(e) e.preventDefault(); 
    
    if (!newTopic.trim()) {
      alert("Vui lòng nhập tên chủ đề!");
      return;
    }
    
    if (newTopic.trim().length > 200) {
      alert("Tên chủ đề quá dài! Vui lòng nhập tối đa 200 ký tự.");
      return;
    }

    setIsLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const data = { name: newTopic };

      if (editingTopic) {
        await axios.put(`http://localhost:8080/api/topics/${editingTopic.id}`, data, config);
        alert("Cập nhật thành công!");
      } else {
        await axios.post("http://localhost:8080/api/topics", data, config);
        alert("Thêm chủ đề mới thành công!");
      }

      setEditingTopic(null);
      setNewTopic("");
      fetchTopics();
    } catch (err) {
      console.error(err);
      alert("Lỗi thao tác: " + (err.response?.data?.message || "Kiểm tra quyền Admin hoặc kết nối Server"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (topic) => {
    setEditingTopic(topic);
    setNewTopic(topic.name);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm("Bạn có chắc muốn xóa chủ đề này?")) {
      axios.delete(`http://localhost:8080/api/topics/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        alert("Đã xóa chủ đề.");
        fetchTopics();
      })
      .catch(err => alert("Không thể xóa: Chủ đề này có thể đang chứa bài viết!"));
    }
  };

  return (
    <div className="p-8 animate-fadeIn font-sans">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter uppercase">Chủ đề bài viết</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Phân loại tin tức công nghệ</p>
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-4 mb-12 bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-50 transition-all focus-within:shadow-xl focus-within:shadow-blue-100/50">
        <input 
          value={newTopic} 
          onChange={e => setNewTopic(e.target.value)}
          maxLength={200}
          placeholder={editingTopic ? "Nhập tên chủ đề mới..." : "Ví dụ: Tin công nghệ, Đánh giá, Khuyến mãi..."} 
          className="flex-1 bg-slate-50 border-none rounded-2xl px-6 py-4 outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-700"
        />
        <button 
          type="submit"
          disabled={isLoading}
          className={`bg-blue-600 text-white px-10 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-100 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700 active:scale-95'}`}
        >
          {isLoading ? "Đang lưu..." : editingTopic ? "Cập nhật ngay" : "Thêm chủ đề"}
        </button>
        
        {editingTopic && (
          <button 
            type="button"
            onClick={() => {setEditingTopic(null); setNewTopic("");}} 
            className="px-4 text-slate-400 font-black text-[10px] uppercase hover:text-red-500 transition-colors"
          >
            Hủy
          </button>
        )}
      </form>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {topics.length > 0 ? topics.map(topic => (
          <div key={topic.id} className="bg-white p-6 rounded-[2.5rem] shadow-sm flex justify-between items-center group hover:shadow-2xl hover:-translate-y-1 transition-all border border-transparent hover:border-blue-100">
            <div className="flex items-center gap-3">
               <span className="w-2 h-2 bg-green-500 rounded-full"></span>
               <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{topic.name}</span>
            </div>
            
            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button 
                onClick={() => handleEdit(topic)} 
                className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-xs hover:bg-blue-600 hover:text-white transition-all shadow-sm"
              >
                ✏️
              </button>
              <button 
                onClick={() => handleDelete(topic.id)} 
                className="w-9 h-9 bg-red-50 text-red-500 rounded-xl flex items-center justify-center text-xs hover:bg-red-500 hover:text-white transition-all shadow-sm"
              >
                ✕
              </button>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-20 text-center border-4 border-dashed border-slate-100 rounded-[3rem]">
            <p className="text-slate-300 font-black uppercase text-xs tracking-[0.3em]">Chưa có chủ đề nào được tạo</p>
          </div>
        )}
      </div>
    </div>
  );
}
