import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    { role: "ai", text: "Xin chào! MobiTech có thể giúp gì cho bạn?" },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setInput("");

    try {
      const response = await axios.post("http://localhost:8080/api/chat/ask", {
        message: input,
      });
      setMessages((prev) => [...prev, { role: "ai", text: response.data.response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "Xin lỗi, tôi đang bận một chút. Thử lại sau nhé!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[999] font-sans">
      {/* NÚT BẤM - Làm nhỏ lại một chút */}
<button
  onClick={() => setIsOpen(!isOpen)}
  className="w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-300"
>
  {isOpen ? <span className="text-xl">✕</span> : <span className="text-xl">💬</span>}
</button>

{/* KHUNG CHAT - Thu gọn chiều rộng (w-72 hoặc 300px) và sát lề phải */}
{isOpen && (
  <div className="absolute bottom-16 right-0 w-[300px] bg-white/70 backdrop-blur-2xl rounded-[2rem] shadow-[0_15px_40px_rgba(0,0,0,0.1)] border border-white/40 overflow-hidden flex flex-col animate-slideUp">
    
    {/* HEADER - Thu nhỏ padding */}
    <div className="bg-blue-600/90 p-4 text-white">
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
        <h3 className="font-black text-[10px] uppercase tracking-widest">Hỗ trợ MobiTech</h3>
      </div>
    </div>

    {/* NỘI DUNG CHAT - Chiều cao ngắn lại (h-80) để không che Banner */}
    <div 
      ref={scrollRef}
      className="h-[320px] overflow-y-auto p-4 space-y-4 bg-transparent"
    >
      {messages.map((msg, index) => (
        <div
          key={index}
          className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[90%] px-4 py-2.5 text-[12px] leading-snug ${
              msg.role === "user"
                ? "bg-blue-600 text-white rounded-2xl rounded-tr-none shadow-sm font-medium"
                : "bg-white/80 text-slate-700 rounded-2xl rounded-tl-none border border-white/50 font-medium shadow-sm"
            }`}
            dangerouslySetInnerHTML={{ __html: msg.text }}
          />
        </div>
      ))}
      {isLoading && (
        <div className="flex gap-1 pl-2">
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
          <div className="w-1 h-1 bg-blue-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
        </div>
      )}
    </div>

    {/* Ô NHẬP LIỆU - Thiết kế tràn viền siêu gọn */}
    <div className="p-3 bg-white/40 border-t border-white/20 flex gap-2 items-center">
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Hỏi gì đó..."
        className="flex-1 bg-white/50 border-none rounded-xl py-2 px-4 text-[12px] font-bold outline-none focus:bg-white transition-all"
      />
      <button
        onClick={handleSend}
        disabled={isLoading}
        className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 transition-all"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current rotate-45">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
        </svg>
      </button>
    </div>
  </div>
)}
    </div>
  );
}