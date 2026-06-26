import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";

// --- CÁC COMPONENT BỔ TRỢ (SUB-COMPONENTS) ---

function SpecGroup({ title, icon, children, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="mb-4 overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-sm transition-all duration-500 italic">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between p-7 transition-colors ${isOpen ? 'bg-slate-50/80' : 'hover:bg-slate-50/40'}`}
      >
        <div className="flex items-center gap-5">
          <span className="text-2xl transform group-hover:scale-110 transition-transform">{icon}</span>
          <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-800 italic">{title}</h4>
        </div>
        <span className={`text-slate-400 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
            <path d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708z"/>
          </svg>
        </span>
      </button>
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-8 pb-8">
          <div className="divide-y divide-slate-50 border-t border-slate-50">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function SpecRow({ label, value }) {
  return (
    <div className="flex py-5 transition-colors hover:bg-slate-50/20 italic">
      <div className="w-1/3 text-[10px] font-black uppercase tracking-widest text-slate-400 self-center italic">
        {label}:
      </div>
      <div className="w-2/3 text-sm font-bold text-slate-700 italic uppercase leading-tight italic">
        {value || "Đang cập nhật"}
      </div>
    </div>
  );
}

// --- MAIN COMPONENT ---
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("desc");

  const [selectedRam, setSelectedRam] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [displayPrice, setDisplayPrice] = useState(0);
  const [currentImage, setCurrentImage] = useState("");

  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/reviews/product/${id}`);
      setReviews(res.data);
    } catch (err) {
      console.error("Lỗi tải đánh giá:", err);
    }
  };

  useEffect(() => {
    setLoading(true);
    axios.get(`http://localhost:8080/api/products/${id}`)
      .then(res => {
        let data = res.data;
        if (data.colorVariants && typeof data.colorVariants === 'string') {
          try { data.colorVariants = JSON.parse(data.colorVariants); } 
          catch (e) { data.colorVariants = []; }
        }
        
        setProduct(data);
        setDisplayPrice(data.price);

        const options = data.ramOptions ? JSON.parse(data.ramOptions) : [];
        if (options.length > 0) setSelectedRam(options[0].label);

        if (data.colorVariants?.length > 0) {
          setSelectedColor(data.colorVariants[0].colorName);
          setCurrentImage(data.colorVariants[0].imageUrl || data.imageUrl);
        } else {
          setCurrentImage(data.imageUrl);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
    if (id) fetchReviews();
  }, [id]);

  useEffect(() => {
  if (product) {
    const options = product.ramOptions ? JSON.parse(product.ramOptions) : [];
    const selectedOpt = options.find(r => r.label === selectedRam);
    
    // CỘNG THÊM GIÁ: Nếu tùy chọn có giá trị phụ trội, cộng vào giá gốc
    if (selectedOpt && selectedOpt.extra > 0) {
      setDisplayPrice(product.price + selectedOpt.extra);
    } else {
      setDisplayPrice(product.price);
    }

    const colorData = product.colorVariants?.find(c => c.colorName === selectedColor);
    if (colorData?.imageUrl) setCurrentImage(colorData.imageUrl);
  }
}, [selectedRam, selectedColor, product]);

  const handleAddToCartClick = () => {
    const user = localStorage.getItem("user");
    if (!user) {
      alert("⚠️ Bạn cần đăng nhập để thực hiện mua sản phẩm này!");
      navigate("/login");
      return;
    }

    const colorObj = product.colorVariants?.find(c => c.colorName === selectedColor) || { colorName: "Mặc định", imageUrl: product.imageUrl };
    
    addToCart(
      { ...product, price: displayPrice, imageUrl: currentImage }, 
      { name: colorObj.colorName, image: colorObj.imageUrl || product.imageUrl, ram: selectedRam }
    );
  };

  const handleSendReview = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) return alert("Vui lòng đăng nhập để đánh giá!");
    if (!newReview.comment.trim()) return alert("Nội dung trống!");

    try {
      await axios.post("http://localhost:8080/api/reviews", {
        productId: id,
        user_fullName: user.fullName || user.username,
        userAvatar: user.avatar || "",
        rating: newReview.rating,
        comment: newReview.comment
      });
      alert("Đánh giá thành công!");
      setNewReview({ rating: 5, comment: "" });
      fetchReviews();
    } catch (err) {
      alert("Lỗi khi gửi đánh giá!");
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase tracking-widest italic text-xl">Initializing Experience...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-bold text-red-500">Sản phẩm không tồn tại!</div>;

  return (
    <div className="min-h-screen bg-[#fbfbfb] pb-32 font-sans text-slate-900 italic">
      <div className="max-w-7xl mx-auto px-6 pt-10 italic">
        <button onClick={() => navigate("/")} className="mb-10 text-[10px] font-black text-slate-400 hover:text-blue-600 transition flex items-center gap-2 uppercase tracking-widest italic">
          ← Cửa hàng / {product.category?.name}
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-start mb-24 italic">
          <div className="lg:col-span-5 bg-white rounded-[4.5rem] p-10 flex items-center justify-center border border-slate-100 shadow-sm sticky top-28 aspect-[4/5] italic text-center">
             <img key={currentImage} src={currentImage} className="w-full h-full object-contain drop-shadow-2xl animate-fadeIn transition-all duration-700 hover:scale-105 mix-blend-darken" alt={product.name} />
          </div>

          <div className="lg:col-span-7 flex flex-col italic pl-4">
            <span className="text-blue-600 font-black uppercase tracking-[0.2em] text-[10px] mb-4 bg-blue-50 w-fit px-5 py-2 rounded-full shadow-sm italic">
              Official Store • {product.category?.name}
            </span>
            <h1 className="text-6xl font-black text-slate-900 mb-2 tracking-tighter leading-tight uppercase italic drop-shadow-sm">
              {product.name}
            </h1>
            <p className="text-5xl font-black text-blue-600 mb-12 mt-2 tracking-tighter italic">
              {displayPrice.toLocaleString()}đ
            </p>

            {/* DUNG LƯỢNG - HIỂN THỊ CÁC TÙY CHỌN DUNG LƯỢNG CỦA BẠN */}
            {/* DUNG LƯỢNG */}
<div className="mb-10 space-y-5 italic">
  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
    <span className="w-6 h-px bg-slate-200"></span> Cấu hình lưu trữ
  </p>
  <div className="flex gap-4 flex-wrap italic">
    {(product.ramOptions ? JSON.parse(product.ramOptions) : []).map((ram) => (
      <button 
        key={ram.label} 
        onClick={() => setSelectedRam(ram.label)}
        className={`px-8 py-5 rounded-[1.8rem] font-black text-xs transition-all border-2 italic 
        ${selectedRam === ram.label 
          ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-xl shadow-blue-100 scale-105' 
          : 'border-slate-200 text-slate-500 hover:border-slate-300 bg-white hover:scale-105'}`}
      >
        {ram.label}
      </button>
    ))}
  </div>
</div>

            {/* MÀU SẮC */}
            <div className="mb-12 space-y-5 italic">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-2 italic">
                <span className="w-6 h-px bg-slate-200"></span> Màu sắc sắc sảo
              </p>
              <div className="flex gap-4 flex-wrap italic">
                {product.colorVariants?.map((color, index) => (
                  <button key={index} onClick={() => setSelectedColor(color.colorName)}
                    className={`group flex items-center gap-3 p-2 pr-6 rounded-full border-2 transition-all italic
                    ${selectedColor === color.colorName ? 'border-slate-900 bg-slate-900 text-white shadow-2xl scale-105' : 'border-slate-100 bg-white hover:border-slate-200'}`}>
                    <div className="w-9 h-9 rounded-full border border-white/30 shadow-inner" style={{backgroundColor: color.hex || '#ccc'}}></div>
                    <span className="text-[10px] font-black uppercase italic tracking-wider">{color.colorName}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5 mb-12 italic">
               <div className="p-5 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 italic">
                  <span className="text-3xl">🛡️</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase italic">Bảo hành VIP</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">12 Tháng 1 đổi 1</p>
                  </div>
               </div>
               <div className="p-5 bg-slate-50/80 rounded-[2.5rem] border border-slate-100 flex items-center gap-4 italic">
                  <span className="text-3xl">🚚</span>
                  <div>
                    <p className="text-[10px] font-black text-slate-800 uppercase italic">Giao hỏa tốc</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter italic">Miễn phí nội thành</p>
                  </div>
               </div>
            </div>

            <div className="flex gap-4 italic">
              <button 
                onClick={handleAddToCartClick} 
                className={`flex-1 py-7 rounded-[2.2rem] font-black text-xs uppercase tracking-[0.25em] shadow-2xl active:scale-95 transition-all italic ${
                  localStorage.getItem("user") ? 'bg-slate-900 text-white hover:bg-blue-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {localStorage.getItem("user") ? "THÊM VÀO GIỎ HÀNG" : "ĐĂNG NHẬP ĐỂ MUA HÀNG"}
              </button>
              <button className="w-24 h-24 flex items-center justify-center border-2 border-slate-100 rounded-full hover:bg-red-50 hover:border-red-100 transition shadow-sm group italic">
                  <span className="text-3xl group-hover:scale-125 transition-transform duration-500">🤍</span>
              </button>
            </div>
          </div>
        </div>

        {/* --- TABS CHI TIẾT --- */}
        <div className="mt-20 italic">
          <div className="flex justify-center gap-16 border-b border-slate-100 mb-16 italic">
            {[
              { id: 'desc', label: 'Đặc điểm nổi bật' },
              { id: 'spec', label: 'Thông số kỹ thuật' },
              { id: 'review', label: 'Đánh giá khách hàng' }
            ].map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`pb-6 text-[12px] font-black uppercase tracking-[0.3em] transition-all relative italic
                ${activeTab === tab.id ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`}>
                {tab.label}
                {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1.5 bg-blue-600 rounded-full animate-slideIn italic"></div>}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-[5rem] p-16 shadow-sm border border-slate-100 italic">
             {activeTab === 'desc' && (
                <div className="animate-fadeIn max-w-4xl mx-auto space-y-12 italic text-center">
                   <h3 className="text-4xl font-black text-slate-800 italic uppercase tracking-tighter leading-tight italic">
                      Cận cảnh chi tiết<br/>siêu phẩm {product.name}
                   </h3>
                   {(() => {
                      try {
                        const steps = JSON.parse(product.description || "[]");
                        if (steps.length === 0) return <p className="text-slate-400 italic text-center py-20 italic">Đang cập nhật nội dung giới thiệu...</p>;
                        return steps.map((step, index) => (
                          <div key={index} className="space-y-8 animate-fadeIn italic">
                             {step.type === 'text' ? (
                               <p className="text-lg text-slate-500 font-medium leading-relaxed italic text-justify whitespace-pre-line px-4 italic">
                                  {step.content}
                               </p>
                             ) : (
                               <div className="flex justify-center group py-4 italic">
                                  <div className="relative w-full max-w-3xl overflow-hidden rounded-[3rem] shadow-2xl transition-all duration-700 group-hover:scale-[1.02] italic">
                                     <img src={step.content} className="w-full h-auto object-cover" alt={`Highlight ${index}`} />
                                  </div>
                               </div>
                             )}
                          </div>
                        ));
                      } catch (e) { return <p className="italic text-slate-500 whitespace-pre-line italic">{product.description}</p>; }
                   })()}
                </div>
             )}

             {activeTab === 'spec' && (
                <div className="animate-fadeIn mx-auto max-w-4xl pb-10 italic">
                  <SpecGroup title="Cấu hình & Bộ nhớ" icon="⚙️" defaultOpen={true}>
                    <SpecRow label="Hệ điều hành" value={product.os} /> 
                    <SpecRow label="Chip xử lý (CPU)" value={product.cpu} />
                    <SpecRow label="Chip đồ họa (GPU)" value={product.gpu} />
                    <SpecRow label="RAM" value={product.ram} />
                    
                  </SpecGroup>

                  <SpecGroup title="Camera & Màn hình" icon="📸">
                    <SpecRow label="Màn hình" value={product.screen} />
                    <SpecRow label="Camera sau" value={product.camera} />
                  </SpecGroup>

                  <SpecGroup title="Pin & Sạc" icon="🔋">
                    <SpecRow label="Dung lượng pin" value={product.battery} />
                  </SpecGroup>

                  <SpecGroup title="Bảo mật & Khác" icon="🔐">
                    <SpecRow label="Bảo mật" value={product.security} />
                  </SpecGroup>
                </div>
             )}

             {activeTab === 'review' && (
                <div className="animate-fadeIn space-y-16 italic">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-10 italic">
                    <div className="bg-slate-50 rounded-[4rem] p-12 flex flex-col items-center justify-center border border-slate-100 shadow-inner italic">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] mb-4 italic">Rating trung bình</p>
                      <h2 className="text-7xl font-black text-slate-900 tracking-tighter italic">
                        {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : "0.0"}
                      </h2>
                      <div className="flex gap-1.5 mt-5 text-yellow-400 text-2xl italic">⭐⭐⭐⭐⭐</div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase mt-5 italic">{reviews.length} Phản hồi</p>
                    </div>

                    <div className="md:col-span-2 bg-white rounded-[4rem] p-12 border border-slate-100 shadow-xl italic">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.3em] text-blue-600 mb-8 italic">Viết cảm nhận</h4>
                      <div className="flex gap-3 mb-6 italic">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setNewReview({...newReview, rating: s})} className={`text-3xl transition-all ${s <= newReview.rating ? 'scale-110' : 'grayscale opacity-20'}`}>⭐</button>
                        ))}
                      </div>
                      <textarea 
                        className="w-full p-8 rounded-[2.5rem] border-none bg-slate-50 font-medium text-slate-600 outline-none focus:ring-4 ring-blue-500/10 transition-all min-h-[140px] resize-none italic"
                        placeholder="Hãy chia sẻ trải nghiệm thực tế của bạn..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                      />
                      <div className="flex justify-end mt-6 italic">
                        <button onClick={handleSendReview} className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-blue-600 transition-all shadow-lg italic">Gửi ngay →</button>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-10 italic">
                    {reviews.length > 0 ? (
                      reviews.map((r) => (
                        <div key={r.id} className="bg-white p-10 rounded-[3.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-700 group relative italic">
                          <div className="flex justify-between items-start mb-8 italic text-left">
                            <div className="flex items-center gap-6 italic">
                              <div className="relative italic">
                                {r.userAvatar ? (
                                  <img src={r.userAvatar} className="w-20 h-20 rounded-[1.8rem] object-cover shadow-xl border-4 border-white group-hover:rotate-6 transition-all duration-700 italic" alt="Avatar"/>
                                ) : (
                                  <div className="w-20 h-20 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-[1.8rem] flex items-center justify-center font-black text-white text-2xl shadow-xl group-hover:-rotate-6 transition-all duration-700 italic uppercase">
                                    {r.user_fullName?.charAt(0)}
                                  </div>
                                )}
                                <div className="absolute -bottom-1 -right-1 bg-green-500 text-white w-7 h-7 rounded-full flex items-center justify-center border-4 border-white text-[10px] shadow-sm italic">✓</div>
                              </div>
                              <div className="italic text-left">
                                <h5 className="font-black text-slate-800 text-base uppercase italic">{r.user_fullName}</h5>
                                <div className="flex gap-1 mt-1.5 italic">
                                  {[...Array(5)].map((_, i) => (
                                    <span key={i} className={`text-sm ${i < r.rating ? 'text-yellow-400' : 'text-slate-100'}`}>★</span>
                                  ))}
                                  <span className="ml-3 text-[9px] font-black text-blue-600 uppercase bg-blue-50 px-3 py-1 rounded-full italic">Buyer Verified</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest italic">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</span>
                          </div>
                          <div className="pl-24 relative italic text-left">
                            <div className="absolute left-[88px] top-0 w-1.5 h-full bg-slate-50 rounded-full italic"></div>
                            <p className="text-slate-500 text-[17px] font-medium leading-relaxed italic pr-12">"{r.comment}"</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-24 bg-slate-50 rounded-[5rem] border-4 border-dashed border-slate-100 italic">
                          <div className="text-7xl mb-8 grayscale opacity-20 italic">⭐</div>
                          <p className="text-slate-400 font-black uppercase tracking-[0.5em] text-xs italic">Waiting for first review</p>
                      </div>
                    )}
                  </div>
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}