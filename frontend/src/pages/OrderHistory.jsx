import { useState, useEffect } from 'react';
import axios from 'axios';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const user = JSON.parse(localStorage.getItem("user")); 

  useEffect(() => {
    if (user) {
      fetchUserOrders();
    }
  }, []);

  const fetchUserOrders = async () => {
    try {
      // Đảm bảo URL này khớp với OrderController: @GetMapping("/user/{userId}")
      const res = await axios.get(`http://localhost:8080/api/orders/user/${user.id}`);
      setOrders(res.data);
    } catch (err) {
      console.error("Lỗi tải lịch sử đơn hàng", err);
    }
  };

  const handleCancel = async (orderId) => {
    if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
      try {
        await axios.put(`http://localhost:8080/api/orders/${orderId}/cancel`);
        alert("Đã hủy đơn hàng thành công");
        fetchUserOrders(); 
      } catch (err) {
        alert(err.response?.data?.message || "Lỗi khi hủy đơn");
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 italic font-sans">
      <h2 className="text-3xl font-black uppercase tracking-tighter mb-10 italic">Lịch sử mua hàng</h2>
      
      <div className="space-y-8">
        {orders.map(order => (
          <div key={order.id} className="bg-white p-8 rounded-[3rem] shadow-xl shadow-slate-100 border border-slate-50 animate-fadeIn">
            {/* PHẦN ĐẦU ĐƠN HÀNG */}
            <div className="flex justify-between items-start mb-6 border-b border-slate-50 pb-6">
              <div>
                <p className="font-black text-xl italic text-slate-800">Mã đơn: #{order.id}</p>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1 italic">
                  Ngày đặt: {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                </p>
              </div>
              <div className="text-right">
                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic ${
                  order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                  order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                }`}>
                  {order.status === 'PENDING' ? '⏳ Chờ duyệt' : 
                   order.status === 'CANCELLED' ? '🚫 Đã hủy' : '✅ Đã duyệt'}
                </span>
              </div>
            </div>

            {/* DANH SÁCH SẢN PHẨM (Phần bạn đang thiếu) */}
            <div className="space-y-4 mb-6">
              {order.details && order.details.map((item, index) => (
                <div key={index} className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-2xl">
                  <img 
                    src={item.product?.imageUrl} 
                    alt="product" 
                    className="w-16 h-16 object-contain bg-white rounded-xl p-2 border border-slate-100"
                  />
                  <div className="flex-1">
                    <p className="font-black text-slate-700 text-sm uppercase italic">{item.product?.name}</p>
                    <p className="text-[10px] text-slate-400 font-bold italic">
                      Màu: {item.colorName} | SL: {item.quantity}
                    </p>
                  </div>
                  <p className="font-black text-slate-800 italic">{item.price?.toLocaleString()}đ</p>
                </div>
              ))}
            </div>

            {/* TỔNG TIỀN VÀ NÚT HỦY */}
            <div className="flex justify-between items-center mt-6 pt-6 border-t border-slate-50 italic">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase italic">Tổng thanh toán</p>
                <p className="text-2xl font-black text-blue-600 italic">{order.total?.toLocaleString()}đ</p>
              </div>
              
              {order.status === 'PENDING' && (
                <button 
                  onClick={() => handleCancel(order.id)}
                  className="bg-red-50 text-red-500 px-6 py-3 rounded-2xl text-[10px] font-black uppercase hover:bg-red-500 hover:text-white transition-all italic shadow-sm"
                >
                  Hủy đơn hàng
                </button>
              )}
            </div>
          </div>
        ))}

        {orders.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-[4rem] border-4 border-dashed border-slate-100 italic">
            <p className="text-slate-400 font-black uppercase tracking-widest italic">Bạn chưa có đơn hàng nào</p>
          </div>
        )}
      </div>
    </div>
  );
}