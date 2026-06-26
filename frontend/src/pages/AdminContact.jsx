import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function AdminContact() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // Hàm phụ trợ để xác định ID khách hàng chuẩn (không phải ID 0)
  const getActualCustomerId = (item) => {
    if (!item) return null;
    return item.senderId !== 0 ? item.senderId : item.receiverId;
  };

  // 1. Tải danh sách khách hàng duy nhất
  const fetchChatList = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/chat/admin/all");
      const customerMap = new Map();

      res.data.forEach(msg => {
        const cId = getActualCustomerId(msg);
        if (cId && cId !== 0) {
          // Lưu tin nhắn mới nhất để hiển thị preview và lấy thông tin khách
          if (!customerMap.has(cId) || new Date(msg.timestamp) > new Date(customerMap.get(cId).timestamp)) {
            customerMap.set(cId, msg);
          }
        }
      });
      setCustomers(Array.from(customerMap.values()));
    } catch (err) {
      console.error("Lỗi danh sách:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatList();
    const interval = setInterval(fetchChatList, 5000);
    return () => clearInterval(interval);
  }, []);

  // 2. Tải lịch sử chat chi tiết
  useEffect(() => {
    const cId = getActualCustomerId(selectedCustomer);
    if (cId) {
      const fetchHistory = async () => {
        try {
          const res = await axios.get(`http://localhost:8080/api/chat/history/${cId}`);
          setMessages(res.data);
        } catch (err) { console.error("Lỗi lịch sử:", err); }
      };
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedCustomer]);

  useEffect(scrollToBottom, [messages]);

  // 3. Gửi tin nhắn phản hồi
  const handleSendReply = async () => {
    const cId = getActualCustomerId(selectedCustomer);
    if (!reply.trim() || !cId) return;

    const adminMsg = {
      senderId: 0,
      receiverId: cId,
      content: reply,
      isFromAdmin: true,
      timestamp: new Date()
    };

    try {
      await axios.post("http://localhost:8080/api/chat/send", adminMsg);
      setReply("");
      // Cập nhật local ngay lập tức để mượt mà
      const res = await axios.get(`http://localhost:8080/api/chat/history/${cId}`);
      setMessages(res.data);
    } catch (err) {
      alert("Không thể gửi tin nhắn!");
    }
  };

  if (loading) return <div className="p-20 text-center font-black animate-pulse italic">ĐANG TẢI HỘP THƯ...</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-4 font-sans italic">
      {/* SIDEBAR BÊN TRÁI */}
      <div className="w-1/3 bg-white rounded-[3rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex justify-between items-center">
          <h2 className="text-xl font-black uppercase tracking-tighter italic">Hộp thư hỗ trợ</h2>
          <span className="bg-blue-100 text-blue-600 text-[10px] px-3 py-1 rounded-full font-black italic">
            {customers.length} KHÁCH
          </span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {customers.map((c, idx) => {
            const cId = getActualCustomerId(c);
            const isSelected = getActualCustomerId(selectedCustomer) === cId;
            return (
              <button 
                key={idx}
                onClick={() => setSelectedCustomer(c)}
                className={`w-full p-6 rounded-[2rem] flex items-center gap-4 transition-all duration-300 ${
                  isSelected ? 'bg-slate-900 text-white shadow-2xl scale-[1.02]' : 'bg-slate-50 text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black text-white italic shadow-inner">
                  {c.name?.charAt(0) || "U"}
                </div>
                <div className="text-left overflow-hidden flex-1">
                  <p className="font-black uppercase text-xs truncate italic">{c.name || `User #${cId}`}</p>
                  <p className="text-[10px] truncate italic opacity-60 mt-1">{c.content}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* KHUNG CHAT CHI TIẾT */}
      <div className="flex-1 bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {selectedCustomer ? (
          <>
            <div className="p-8 bg-slate-900 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-lg">👤</div>
                <div>
                  <h3 className="font-black uppercase text-sm italic tracking-wide">
                    {selectedCustomer.name || `Khách hàng #${getActualCustomerId(selectedCustomer)}`}
                  </h3>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest italic animate-pulse">Trực tuyến</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/50 custom-scrollbar">
              {messages.map((msg, index) => {
                // ÉP KIỂU Boolean triệt để cho isFromAdmin
                const isAdmin = msg.isFromAdmin === true || msg.isFromAdmin === 1 || msg.fromAdmin === true;
                
                return (
                  <div key={index} className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} mb-2`}>
                    <span className={`text-[9px] font-black uppercase tracking-widest mb-1 px-4 italic ${isAdmin ? 'text-blue-600' : 'text-slate-400'}`}>
                      {isAdmin ? "Bạn (Admin)" : (selectedCustomer.name || "Khách hàng")}
                    </span>

                    <div className={`max-w-[75%] p-5 rounded-[2.5rem] shadow-sm text-sm font-bold italic relative ${
                      isAdmin ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border rounded-tl-none'
                    }`}>
                      {msg.content}
                      <p className={`text-[8px] mt-2 opacity-40 font-black ${isAdmin ? 'text-right' : 'text-left'}`}>
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            <div className="p-6 bg-white border-t flex gap-4">
              <input 
                className="flex-1 p-5 bg-slate-50 rounded-2xl outline-none font-bold italic text-sm focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Nhập nội dung phản hồi..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendReply()}
              />
              <button 
                onClick={handleSendReply}
                className="bg-blue-600 text-white px-10 rounded-2xl font-black uppercase text-[10px] hover:bg-slate-900 transition-all shadow-lg active:scale-95"
              >
                GỬI PHẢN HỒI →
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-300 italic">
            <span className="text-6xl mb-4">💬</span>
            <p className="font-black uppercase tracking-widest text-xs">Chọn một khách hàng để bắt đầu</p>
          </div>
        )}
      </div>
    </div>
  );
}