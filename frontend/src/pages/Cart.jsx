import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import axios from "axios"; // Bổ sung thư viện gọi API

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity } = useCart();
  const navigate = useNavigate();

  // State quản lý sản phẩm được chọn
  const [selectedItems, setSelectedItems] = useState(() => 
    cartItems.map(item => `${item.id}-${item.selectedColorName}`)
  );

  // Cập nhật lại danh sách chọn nếu giỏ hàng thay đổi (xóa sp)
  useEffect(() => {
    setSelectedItems(prev => {
      const currentIds = cartItems.map(item => `${item.id}-${item.selectedColorName}`);
      return prev.filter(id => currentIds.includes(id));
    });
  }, [cartItems]);

  const selectedCartItems = cartItems.filter(item => selectedItems.includes(`${item.id}-${item.selectedColorName}`));
  const totalPrice = selectedCartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(cartItems.map(item => `${item.id}-${item.selectedColorName}`));
    } else {
      setSelectedItems([]);
    }
  };

  // --- 1. STATE QUẢN LÝ VOUCHER ---
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoMessage, setPromoMessage] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);

  // Tự động tính toán lại tiền giảm nếu Giỏ hàng thay đổi số lượng
  useEffect(() => {
    if (appliedPromo) {
      if (totalPrice < appliedPromo.minOrderValue) {
        // Hủy mã nếu khách giảm số lượng làm tổng tiền không đủ điều kiện
        setAppliedPromo(null);
        setDiscountAmount(0);
        setPromoMessage(`Mã bị hủy do tổng đơn chưa đạt ${appliedPromo.minOrderValue.toLocaleString()}đ`);
      } else {
        // Tính toán lại tiền giảm
        if (appliedPromo.discountType === 'PERCENT') {
          setDiscountAmount((totalPrice * appliedPromo.discountValue) / 100);
        } else {
          setDiscountAmount(appliedPromo.discountValue);
        }
      }
    } else {
      setDiscountAmount(0);
    }
  }, [totalPrice, appliedPromo]);

  // --- 2. HÀM KIỂM TRA MÃ ---
  const handleApplyPromo = async () => {
    if (!promoCodeInput) return;
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const userIdStr = (user && user.id) ? `&userId=${user.id}` : "";
      const res = await axios.get(`http://localhost:8080/api/promotions/check?code=${promoCodeInput}&orderTotal=${totalPrice}${userIdStr}`);
      const promo = res.data;
      setAppliedPromo(promo);
      setPromoMessage("Áp dụng mã thành công!");
    } catch (err) {
      setAppliedPromo(null);
      setDiscountAmount(0);
      setPromoMessage(err.response?.data || "Lỗi áp dụng mã!");
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] py-12 px-6 italic font-sans">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black text-slate-900 mb-10 tracking-tighter uppercase">Giỏ hàng của bạn</h1>

        {cartItems.length === 0 ? (
          <div className="text-center bg-white p-20 rounded-[3rem] shadow-sm border border-slate-100">
            <div className="text-6xl mb-6">🛒</div>
            <p className="text-slate-400 font-bold mb-6 text-xl">Giỏ hàng đang trống trơn...</p>
            <button onClick={() => navigate("/")} className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-700 transition shadow-lg shadow-blue-200">
              QUAY LẠI MUA SẮM
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Danh sách sản phẩm */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3 mb-4 px-4">
                <input 
                  type="checkbox" 
                  className="w-5 h-5 accent-blue-600 cursor-pointer"
                  checked={cartItems.length > 0 && selectedItems.length === cartItems.length}
                  onChange={handleSelectAll}
                />
                <span className="font-bold text-slate-600 uppercase text-sm">Chọn tất cả ({cartItems.length})</span>
              </div>
              {cartItems.map((item, index) => {
                const idStr = `${item.id}-${item.selectedColorName}`;
                return (
                <div key={`${idStr}-${index}`} className="bg-white p-6 rounded-[2rem] flex items-center gap-6 shadow-sm border border-white hover:shadow-md transition-shadow">
                  <input 
                    type="checkbox" 
                    className="w-6 h-6 accent-blue-600 cursor-pointer shrink-0"
                    checked={selectedItems.includes(idStr)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedItems([...selectedItems, idStr]);
                      else setSelectedItems(selectedItems.filter(id => id !== idStr));
                    }}
                  />
                  <div className="relative group">
                    <img 
                      src={item.selectedColorImage || item.imageUrl} 
                      className="w-28 h-28 object-contain bg-slate-50 rounded-[1.5rem] p-2" 
                      alt={item.name} 
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[10px] font-black shadow-sm border border-slate-100 whitespace-nowrap uppercase">
                      {item.selectedColorName}
                    </span>
                  </div>

                  <div className="flex-1 ml-2">
                    <h3 className="font-black text-slate-800 text-lg uppercase leading-tight">{item.name}</h3>
                    <p className="text-blue-600 font-black text-xl mt-1">{item.price?.toLocaleString()}đ</p>
                    <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest">
                      Phân loại: {item.selectedColorName || "Mặc định"}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedColorName, -1)} 
                      className="w-10 h-10 bg-white rounded-xl font-black shadow-sm hover:bg-red-50 hover:text-red-500 transition"
                    >
                      -
                    </button>
                    <span className="font-black px-3 text-lg">{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.id, item.selectedColorName, 1)} 
                      className="w-10 h-10 bg-white rounded-xl font-black shadow-sm hover:bg-blue-50 hover:text-blue-500 transition"
                    >
                      +
                    </button>
                  </div>

                  <button 
                    onClick={() => removeFromCart(item.id, item.selectedColorName)} 
                    className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-red-500 transition-colors"
                  >
                    <span className="text-xl font-bold">✕</span>
                  </button>
                </div>
                );
              })}
            </div>

            {/* Cột Tổng tiền & Thanh toán */}
            <div className="lg:col-span-1">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-white h-fit sticky top-28">
                <h3 className="text-xl font-black mb-8 border-b border-slate-50 pb-4 uppercase tracking-tighter">Tóm tắt đơn hàng</h3>
                
                {/* --- 3. KHU VỰC NHẬP MÃ GIẢM GIÁ --- */}
                <div className="mb-6 pb-6 border-b border-slate-50">
                    <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-4">🎟️ Mã Khuyến Mãi</h4>
                    <div className="flex gap-2">
                        <input 
                            type="text" 
                            placeholder="NHẬP MÃ..." 
                            className="flex-1 bg-slate-50 p-4 rounded-2xl font-black uppercase outline-none border border-slate-100 text-sm placeholder:text-slate-300"
                            value={promoCodeInput}
                            onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                            disabled={appliedPromo != null} 
                        />
                        {appliedPromo ? (
                            <button onClick={() => { setAppliedPromo(null); setPromoCodeInput(''); setPromoMessage(''); }} className="bg-red-50 text-red-500 px-6 py-4 rounded-2xl font-black uppercase text-[10px] hover:bg-red-500 hover:text-white transition-all shadow-sm">
                                Hủy
                            </button>
                        ) : (
                            <button onClick={handleApplyPromo} className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black uppercase text-[10px] shadow-lg hover:bg-blue-700 transition-all">
                                Dùng
                            </button>
                        )}
                    </div>
                    {promoMessage && (
                        <p className={`text-[9px] font-black uppercase mt-3 tracking-widest ${appliedPromo ? 'text-green-500' : 'text-red-500'}`}>
                            {promoMessage}
                        </p>
                    )}
                </div>

                {/* --- 4. CẬP NHẬT TỔNG TIỀN --- */}
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Tạm tính ({selectedCartItems.length} SP):</span>
                    <span className="font-bold text-slate-800">{totalPrice.toLocaleString()}đ</span>
                  </div>
                  
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-500 font-medium">
                      <span>Giảm giá (Voucher):</span>
                      <span className="font-bold">- {discountAmount.toLocaleString()}đ</span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-500 font-medium">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-500 font-bold">Miễn phí</span>
                  </div>
                </div>

                <div className="flex justify-between mb-10 pt-6 border-t border-slate-50">
                  <span className="font-black text-lg uppercase tracking-widest">Tổng cộng:</span>
                  <div className="text-right">
                    <p className="font-black text-3xl text-blue-600">
                        {Math.max(0, totalPrice - discountAmount).toLocaleString()}đ
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-1">Đã bao gồm VAT</p>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    if (selectedItems.length === 0) {
                      alert("Vui lòng chọn ít nhất 1 sản phẩm để thanh toán!");
                      return;
                    }
                    navigate("/checkout", { 
                    // Truyền dữ liệu Voucher sang trang Checkout
                    state: { 
                      promoCode: appliedPromo?.code, 
                      discountAmount: discountAmount,
                      selectedItems: selectedItems
                    } 
                  })}}
                  className="w-full bg-slate-900 text-white py-6 rounded-3xl font-black hover:bg-blue-600 transition-all active:scale-95 shadow-2xl shadow-blue-100 uppercase tracking-widest text-sm"
                >
                  TIẾN HÀNH THANH TOÁN
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}