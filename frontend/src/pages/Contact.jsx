import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function Contact() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const fetchMessages = async () => {
    if (!userId) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/chat/history/${userId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn:", err);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); 
    return () => { clearInterval(interval); };
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || !userId) return;

    const newMsg = {
      senderId: userId,
      receiverId: 0, 
      content: input,
      isFromAdmin: false,
      timestamp: new Date()
    };

    try {
      await axios.post("http://localhost:8080/api/chat/send", newMsg);
      setMessages(prev => [...prev, newMsg]);
      setInput("");
    } catch (err) {
      alert("Không thể gửi tin nhắn!");
    }
  };

  if (!user) return <div className="p-20 text-center font-black italic uppercase">Vui lòng đăng nhập để chat</div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-6 font-sans italic">
      <div className="max-w-4xl mx-auto bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col h-[80vh] italic">
        
        <div className="bg-slate-900 p-8 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-blue-500/20">🎧</div>
          <div>
            <h3 className="text-white font-black uppercase italic tracking-tighter">Hỗ trợ trực tuyến</h3>
            <p className="text-blue-400 text-[10px] font-bold uppercase tracking-widest italic animate-pulse">Admin Mobitech Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 italic custom-scrollbar">
          {messages.map((msg, index) => {
            // KIỂM TRA TRIỆT ĐỂ: Bao gồm cả trường hợp Jackson tự đổi tên trường thành 'fromAdmin'
            const isAdmin = 
              msg.isFromAdmin === true || 
              msg.isFromAdmin === 1 || 
              msg.fromAdmin === true ||
              msg.fromAdmin === 1;

            return (
              <div key={index} className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} mb-4`}>
                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1 px-4 italic">
                  {isAdmin ? "Admin Mobitech" : user.fullName}
                </span>

                <div className={`relative max-w-[75%] p-5 rounded-[2.5rem] font-bold text-sm shadow-sm italic transition-all duration-300 ${
                  isAdmin 
                    ? 'bg-white text-slate-800 border border-slate-100 rounded-tl-none' 
                    : 'bg-blue-600 text-white rounded-tr-none shadow-blue-200'
                }`}>
                  {msg.content}
                  <p className={`text-[8px] mt-2 opacity-50 font-black ${isAdmin ? 'text-left' : 'text-right'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="p-6 bg-white border-t border-slate-100 flex gap-4 italic items-center">
          <input 
            className="flex-1 p-5 bg-slate-50 rounded-[2rem] outline-none font-bold italic text-sm focus:bg-white focus:ring-4 focus:ring-blue-500/5 transition-all"
            placeholder="Bạn cần hỗ trợ điều gì?..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit" className="bg-slate-900 text-white w-16 h-16 rounded-full flex items-center justify-center font-black italic hover:bg-blue-600 transition-all shadow-xl active:scale-95">✈️</button>
        </form>
      </div>
    </div>
  );
}