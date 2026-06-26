import { useState, useEffect } from "react";
import axios from "axios";

export default function AdminOrder() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null); // Để xem chi tiết đơn
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
    const res = await axios.get("http://localhost:8080/api/orders");
    
    // Kiểm tra xem res.data có đúng là một mảng (Array) không trước khi sort
    const orders = Array.isArray(res.data) ? res.data : [];
    
    const sortedData = orders.sort((a, b) => {
        // Logic sort của bạn giữ nguyên
        return new Date(b.createdAt) - new Date(a.createdAt); 
    });
    
    setOrders(sortedData);
} catch (error) {
    console.error("Lỗi khi lấy danh sách đơn hàng:", error);
    setOrders([]); // Set mảng rỗng để không bị sập giao diện
}
  };

  const updateStatus = async (orderId, newStatus) => {
    const confirmMsg = newStatus === 'CANCELLED' ? "Xác nhận HỦY đơn hàng này?" : "Xác nhận chuyển trạng thái?";
    if (!window.confirm(confirmMsg)) return;

    try {
      await axios.put(`http://localhost:8080/api/orders/${orderId}/status`, { status: newStatus });
      alert("Cập nhật thành công!");
      fetchOrders(); 
      if(selectedOrder) setSelectedOrder(null); // Đóng modal nếu đang mở
    } catch (err) {
      alert("Không thể cập nhật trạng thái!");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-orange-50 text-orange-600 border border-orange-100';
      case 'CONFIRMED': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'SHIPPING': return 'bg-purple-50 text-purple-600 border border-purple-100';
      case 'DELIVERED': return 'bg-green-500 text-white shadow-lg shadow-green-100';
      case 'CANCELLED': return 'bg-red-500 text-white shadow-lg shadow-red-100';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  // Lọc đơn hàng theo Tab
  const filteredOrders = orders.filter(o => filter === "ALL" || o.status === filter);

  return (
    <div className="animate-fadeIn p-4">
      <style>{`
        @keyframes slideUp { from { opacity:0; transform: translateY(20px); } to { opacity:1; transform: translateY(0); } }
        .animate-slideUp { animation: slideUp 0.3s ease-out forwards; }
      `}</style>

      <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase">Quản lý Đơn hàng</h2>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Hệ thống xử lý giao dịch thời gian thực
          </p>
        </div>

        {/* BỘ LỌC TAB NHANH */}
        <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 overflow-x-auto max-w-full">
            {["ALL", "PENDING", "SHIPPING", "DELIVERED", "CANCELLED"].map((f) => (
                <button 
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all whitespace-nowrap ${
                        filter === f ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-50'
                    }`}
                >
                    {f === "ALL" ? "Tất cả" : f === "PENDING" ? "Chờ duyệt" : f === "SHIPPING" ? "Đang giao" : f === "DELIVERED" ? "Hoàn tất" : "Đã hủy"}
                </button>
            ))}
        </div>
      </div>

      <div className="bg-white rounded-[3rem] overflow-hidden shadow-sm border border-slate-50 transition-all">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-50">
              <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Mã đơn</th>
              <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest">Khách hàng</th>
              <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Tổng tiền</th>
              <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Trạng thái</th>
              <th className="p-8 text-[10px] font-black uppercase text-slate-400 tracking-widest text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filteredOrders.map((order) => {
              const isLocked = order.status === 'DELIVERED' || order.status === 'CANCELLED';

              return (
                <tr key={order.id} className={`group transition-all ${order.status === 'PENDING' ? 'bg-orange-50/20' : 'hover:bg-slate-50/30'}`}>
                  <td className="p-8">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="font-black text-blue-600 text-sm hover:underline"
                      >
                        #{order.id}
                      </button>
                      <p className="text-[9px] text-slate-300 font-bold mt-1 uppercase italic">Click để xem chi tiết</p>
                  </td>
                  <td className="p-8">
                    <p className="font-black text-slate-700 uppercase text-xs">{order.fullname}</p>
                    <p className="text-[10px] text-slate-400 font-bold tracking-tighter mt-1">{order.phone}</p>
                  </td>
                  <td className="p-8 text-center font-black text-slate-800 text-sm">
                      {order.total?.toLocaleString()}đ
                  </td>
                  <td className="p-8 text-center">
                    <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                      {order.status === 'PENDING' ? '● Chờ duyệt' : 
                       order.status === 'CONFIRMED' ? 'Đã duyệt' :
                       order.status === 'SHIPPING' ? 'Đang giao' :
                       order.status === 'DELIVERED' ? 'Hoàn tất' : 'Đã hủy'}
                    </span>
                  </td>
                  <td className="p-8 text-right">
                    {isLocked ? (
                      <span className="text-[10px] font-black text-slate-200 uppercase tracking-widest">Closed</span>
                    ) : (
                      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {order.status === 'PENDING' && (
                          <button 
                            onClick={() => updateStatus(order.id, 'CONFIRMED')}
                            className="bg-blue-600 text-white text-[9px] font-black px-5 py-2.5 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all uppercase tracking-widest"
                          >
                            Duyệt
                          </button>
                        )}
                        <select 
                          value={order.status}
                          onChange={(e) => updateStatus(order.id, e.target.value)}
                          className="bg-slate-100 text-slate-600 text-[9px] font-black p-2.5 rounded-xl border-none outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
                        >
                          <option value="PENDING">Chờ duyệt</option>
                          <option value="CONFIRMED">Đã duyệt</option>
                          <option value="SHIPPING">Đang giao</option>
                          <option value="DELIVERED">Đã giao</option>
                          <option value="CANCELLED">Hủy đơn</option>
                        </select>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
            <div className="p-20 text-center">
                <p className="text-slate-300 font-black text-sm uppercase tracking-[0.3em]">Không có đơn hàng nào trong mục này</p>
            </div>
        )}
      </div>

      {/* MODAL CHI TIẾT ĐƠN HÀNG */}
      {selectedOrder && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6">
              <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden animate-slideUp">
                  <div className="p-10 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                      <div>
                        <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Chi tiết đơn #{selectedOrder.id}</h3>
                        <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Thông tin vận chuyển & Sản phẩm</p>
                      </div>
                      <button onClick={() => setSelectedOrder(null)} className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center font-bold hover:text-red-500 transition-all">✕</button>
                  </div>
                  
                  <div className="p-10 space-y-8">
                      <div className="grid grid-cols-2 gap-8 text-sm">
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Người nhận</label>
                              <p className="font-black text-slate-700 uppercase">{selectedOrder.fullname}</p>
                          </div>
                          <div className="space-y-1">
                              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Số điện thoại</label>
                              <p className="font-black text-slate-700">{selectedOrder.phone}</p>
                          </div>
                          <div className="col-span-2 space-y-1">
                              <label className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Địa chỉ giao hàng</label>
                              <p className="font-bold text-slate-600 leading-relaxed">{selectedOrder.address}</p>
                          </div>
                      </div>

                      <div className="bg-slate-50 rounded-[2rem] p-8">
                          <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-4">Danh sách sản phẩm</label>
                          {/* Giả sử bạn trả về mảng cartItems trong Order object. 
                             Nếu không, bạn cần gọi API lấy chi tiết orderItems tại đây.
                          */}
                          <div className="space-y-4">
                               <div className="flex justify-between items-center text-xs font-black text-slate-800 border-b border-slate-100 pb-2">
                                   <span>Sản phẩm</span>
                                   <span>Số tiền</span>
                               </div>
                               {/* Ví dụ render nếu có data */}
                               <div className="flex justify-between items-center text-xs">
                                   <span className="text-slate-500">Toàn bộ máy trong giỏ hàng</span>
                                   <span className="font-black text-blue-600">{selectedOrder.total?.toLocaleString()}đ</span>
                               </div>
                          </div>
                      </div>

                      <div className="flex gap-4 pt-4">
                          <button 
                            onClick={() => updateStatus(selectedOrder.id, 'CANCELLED')}
                            className="flex-1 py-4 bg-red-50 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
                          >
                            Hủy đơn này
                          </button>
                          <button 
                             onClick={() => updateStatus(selectedOrder.id, 'CONFIRMED')}
                             className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all"
                          >
                             Phê duyệt & Giao hàng
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
}