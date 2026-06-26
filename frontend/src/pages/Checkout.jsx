import { useState, useEffect } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate, useLocation } from "react-router-dom"; // THÊM useLocation
import axios from "axios";

export default function Checkout() {
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  
  // LẤY THÔNG TIN VOUCHER TỪ TRANG GIỎ HÀNG CHUYỂN SANG
  const location = useLocation();
  const promoCode = location.state?.promoCode || null;
  const discountAmount = location.state?.discountAmount || 0;

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [form, setForm] = useState({
    fullname: localStorage.getItem("fullName") || "",
    phone: localStorage.getItem("phone") || "",
    email: localStorage.getItem("email") || "",
  });

  const [showQR, setShowQR] = useState(false);

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [detailAddress, setDetailAddress] = useState("");

  const cartTotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalPrice = Math.max(0, cartTotal - discountAmount);

  const [bankInfo, setBankInfo] = useState({
    BANK_NAME: "Vietcombank", 
    BANK_ACC: "123456789", 
    BANK_OWNER: "MOBITECH STORE",
    MOMO_ACC: "0987654321" 
  });

  useEffect(() => {
    axios.get("https://provinces.open-api.vn/api/p/").then((res) => setProvinces(res.data));

    axios.get("http://localhost:8080/api/settings")
      .then(res => {
        const data = res.data;
        const info = { ...bankInfo };
        data.forEach(item => {
           if (item.keyName === 'BANK_NAME') info.BANK_NAME = item.valueContent;
           if (item.keyName === 'BANK_ACC') info.BANK_ACC = item.valueContent;
           if (item.keyName === 'BANK_OWNER') info.BANK_OWNER = item.valueContent;
           if (item.keyName === 'MOMO_ACC') info.MOMO_ACC = item.valueContent;
        });
        setBankInfo(info);
      })
      .catch(err => console.error("Lỗi lấy thông tin ngân hàng:", err));
  }, []);

  const handleProvinceChange = (e) => {
    const pCode = e.target.value;
    setSelectedProvince(pCode);
    setSelectedDistrict("");
    setSelectedWard("");
    setDistricts([]);
    setWards([]);
    if (pCode) {
      axios.get(`https://provinces.open-api.vn/api/p/${pCode}?depth=2`).then((res) => setDistricts(res.data.districts));
    }
  };

  const handleDistrictChange = (e) => {
    const dCode = e.target.value;
    setSelectedDistrict(dCode);
    setSelectedWard("");
    setWards([]);
    if (dCode) {
      axios.get(`https://provinces.open-api.vn/api/d/${dCode}?depth=2`).then((res) => setWards(res.data.wards));
    }
  };

  const handlePaymentInitiate = (e) => {
    e.preventDefault();

    if (!form.fullname || !form.phone || !form.email || !selectedProvince || !selectedDistrict || !selectedWard || !detailAddress) {
      alert("Vui lòng nhập đầy đủ thông tin (kể cả Email) và địa chỉ giao hàng!");
      return;
    }

    if (cartItems.length === 0) {
      alert("Giỏ hàng của bạn đang trống!");
      return;
    }

    if (paymentMethod === "BANKING" || paymentMethod === "MOMO") {
      setShowQR(true);
    } else {
      executeSubmitOrder();
    }
  };

  const executeSubmitOrder = async () => {

    const pName = provinces.find((p) => p.code == selectedProvince)?.name || "";
    const dName = districts.find((d) => d.code == selectedDistrict)?.name || "";
    const wName = wards.find((w) => w.code == selectedWard)?.name || "";
    const fullAddress = `${detailAddress}, ${wName}, ${dName}, ${pName}`;

    const user = JSON.parse(localStorage.getItem("user"));

    const orderData = {
      fullname: form.fullname,
      phone: form.phone,
      email: form.email,
      address: fullAddress,
      total: Number(finalPrice), // LƯU TỔNG TIỀN ĐÃ TRỪ VOUCHER
      paymentMethod: paymentMethod,
      status: "PENDING",
      promoCode: promoCode, // GỬI MÃ VOUCHER LÊN BACKEND ĐỂ CỘNG LƯỢT DÙNG
      user: user ? { id: user.id } : null,
      details: cartItems.map((item) => ({
        product: { id: Number(item.id) },
        quantity: Number(item.quantity),
        price: Number(item.price),
        colorImage: item.selectedColorImage || item.image_url || item.imageUrl,
        colorName: item.selectedColorName || "Mặc định",
      })),
    };

    try {
      await axios.post("http://localhost:8080/api/orders", orderData);
      alert("🎉 Đặt hàng thành công!");
      
      if (clearCart) clearCart();
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));
      
      navigate("/order-history");
    } catch (err) {
      console.error("Lỗi đặt hàng:", err.response?.data);
      alert("Có lỗi xảy ra: " + (err.response?.data?.message || "Vui lòng thử lại sau!"));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-16 px-6 font-sans italic">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
      
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-6 text-left italic">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50">
            <h2 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tighter">1. Thông tin giao hàng</h2>
            <div className="space-y-4 italic">
              <div className="grid grid-cols-2 gap-4">
                <input required value={form.fullname} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold italic" placeholder="Họ và tên" onChange={(e) => setForm({ ...form, fullname: e.target.value })} />
                <input required value={form.phone} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold italic" placeholder="Số điện thoại" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <input type="email" required value={form.email} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold italic" placeholder="Email nhận hóa đơn" onChange={(e) => setForm({ ...form, email: e.target.value })} />

              <div className="grid grid-cols-3 gap-3">
                <select className="bg-slate-50 border-none rounded-xl py-4 px-3 text-[10px] font-black uppercase outline-none italic" value={selectedProvince} onChange={handleProvinceChange} required>
                  <option value="">Tỉnh/Thành</option>
                  {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                <select className="bg-slate-50 border-none rounded-xl py-4 px-3 text-[10px] font-black uppercase outline-none italic" value={selectedDistrict} onChange={handleDistrictChange} disabled={!selectedProvince} required>
                  <option value="">Quận/Huyện</option>
                  {districts.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
                </select>
                <select className="bg-slate-50 border-none rounded-xl py-4 px-3 text-[10px] font-black uppercase outline-none italic" value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedDistrict} required>
                  <option value="">Phường/Xã</option>
                  {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
              <input required value={detailAddress} className="w-full p-4 bg-slate-50 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500/20 font-bold italic" placeholder="Số nhà, tên đường..." onChange={(e) => setDetailAddress(e.target.value)} />
            </div>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-50 text-left italic">
            <h2 className="text-2xl font-black mb-6 text-slate-800 uppercase tracking-tighter">2. Phương thức thanh toán</h2>
            <div className="space-y-3 italic">
              {["COD", "MOMO", "BANKING"].map((method) => (
                <div key={method} onClick={() => setPaymentMethod(method)} className={`flex items-center justify-between p-5 rounded-2xl border-2 cursor-pointer transition-all ${paymentMethod === method ? "border-blue-600 bg-blue-50" : "border-slate-50 hover:bg-slate-50"}`}>
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{method === "COD" ? "🚚" : method === "MOMO" ? "🧧" : "🏦"}</span>
                    <span className="font-black text-slate-700 uppercase text-xs tracking-tight">{method === "COD" ? "Tiền mặt (COD)" : method === "MOMO" ? "Ví MoMo" : "Chuyển khoản"}</span>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === method ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                    {paymentMethod === method && <div className="w-2 h-2 bg-white rounded-full"></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl sticky top-10 italic">
            <h3 className="text-xl font-black mb-8 border-b border-white/10 pb-4 uppercase tracking-widest text-blue-400">Tóm tắt đơn hàng</h3>
            <div className="space-y-4 mb-8 max-h-60 overflow-y-auto pr-2 custom-scrollbar italic">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.selectedColorName}`} className="flex justify-between items-center gap-4 bg-white/5 p-4 rounded-3xl">
                  <div className="flex items-center gap-4">
                    <img src={item.selectedColorImage || item.image_url || item.imageUrl} className="w-14 h-14 object-contain rounded-xl bg-white p-1" alt={item.name} />
                    <div>
                      <p className="font-black text-xs uppercase leading-tight">{item.name}</p>
                      <p className="text-[9px] text-slate-500 uppercase font-black mt-1">Màu: {item.selectedColorName || "Mặc định"}</p>
                    </div>
                  </div>
                  <div className="text-right italic">
                    <p className="font-black text-xs">{item.price?.toLocaleString()}đ</p>
                    <p className="text-[9px] text-blue-400 font-black">x{item.quantity}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-white/10 pt-6 mb-8 text-center italic">
              {/* THỂ HIỆN SỐ TIỀN GIẢM GIÁ (NẾU CÓ VOUCHER) */}
              <div className="flex justify-between px-4 text-[11px] font-bold text-slate-400 mb-2 uppercase">
                <span>Tạm tính:</span>
                <span>{cartTotal.toLocaleString()}đ</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between px-4 text-[11px] font-black text-green-400 mb-4 uppercase">
                  <span>Voucher ({promoCode}):</span>
                  <span>- {discountAmount.toLocaleString()}đ</span>
                </div>
              )}

              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 mt-6">Tổng thanh toán</p>
              <p className="text-4xl font-black text-white leading-none tracking-tighter">{finalPrice.toLocaleString()}đ</p>
            </div>
            
            <button onClick={handlePaymentInitiate} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-xl hover:bg-blue-500 transition active:scale-95 uppercase tracking-[0.2em] text-[10px]">
              Xác nhận thanh toán
            </button>
          </div>
        </div>
      </div>

      {/* MODAL MÃ QR THANH TOÁN */}
      {showQR && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white p-8 rounded-[2.5rem] max-w-sm w-full text-center shadow-2xl border border-slate-100 animate-fadeIn">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">{paymentMethod === "MOMO" ? "🧧" : "🏦"}</div>
            <h3 className="text-xl font-black text-slate-800 tracking-tight uppercase mb-1">Thanh toán {paymentMethod === "MOMO" ? "MoMo" : "chuyển khoản"}</h3>
            <p className="text-xs text-slate-500 font-bold mb-6">Quét mã QR dưới đây bằng App Ngân hàng hoặc MoMo</p>
            
            <div className="bg-slate-50 p-4 rounded-3xl mb-6 border-2 border-dashed border-blue-200">
              <img 
                src={`https://img.vietqr.io/image/${paymentMethod === "MOMO" ? "970423" : bankInfo.BANK_NAME}-${paymentMethod === "MOMO" ? bankInfo.MOMO_ACC : bankInfo.BANK_ACC}-compact.png?amount=${finalPrice}&addInfo=THANHTOAN%20DH&accountName=${bankInfo.BANK_OWNER}`} 
                alt="VietQR" 
                className="w-full rounded-2xl mix-blend-multiply" 
              />
            </div>
            
            <div className="bg-slate-50 rounded-2xl p-4 text-left mb-6 font-bold text-sm text-slate-600">
              <p className="flex justify-between mb-2"><span>{paymentMethod === "MOMO" ? "Ví điện tử:" : "Ngân hàng:"}</span> <span className="text-slate-800">{paymentMethod === "MOMO" ? "MoMo" : bankInfo.BANK_NAME}</span></p>
              <p className="flex justify-between mb-2"><span>Số tài khoản:</span> <span className="text-blue-600">{paymentMethod === "MOMO" ? bankInfo.MOMO_ACC : bankInfo.BANK_ACC}</span></p>
              <p className="flex justify-between mb-2"><span>Chủ tài khoản:</span> <span className="text-slate-800">{bankInfo.BANK_OWNER}</span></p>
              <p className="flex justify-between"><span>Số tiền:</span> <span className="text-red-500 font-black">{finalPrice.toLocaleString()}đ</span></p>
            </div>
            
            <button onClick={() => { setShowQR(false); executeSubmitOrder(); }} className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:bg-blue-500 transition-all active:scale-95 mb-3">
              ✅ Tôi đã thanh toán
            </button>
            <button onClick={() => setShowQR(false)} className="w-full bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold uppercase text-xs tracking-widest hover:bg-slate-200 transition-all active:scale-95">
              ❌ Hủy giao dịch
            </button>
          </div>
        </div>
      )}
    </div>
  );
}