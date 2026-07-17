import { useState, useEffect } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import ProductCard from "./ProductCard";

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [banners, setBanners] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(50000000);
  const [loading, setLoading] = useState(true);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchTerm = queryParams.get("search") || "";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resProd, resBrand, resBanner] = await Promise.all([
          axios.get("http://localhost:8080/api/products/active"),
          axios.get("http://localhost:8080/api/brands"),
          axios.get("http://localhost:8080/api/banners").catch(() => ({ data: [] }))
        ]);

        const sortedProducts = resProd.data.sort((a, b) => b.id - a.id);
        const productsWithNewFlag = sortedProducts.map((p, idx) => ({
           ...p,
           isNew: idx < 4
        }));
        setProducts(productsWithNewFlag);
        setBrands(resBrand.data);
        
        if (resBanner.data.length > 0) {
          setBanners(resBanner.data);
        } else {
          setBanners([
            { id: 1, url: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?q=80&w=2000", title: "Khám phá iPhone 15 Pro" },
            { id: 2, url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2000", title: "Siêu phẩm Galaxy S24" }
          ]);
        }
      } catch (err) {
        console.error("Lỗi tải dữ liệu Home:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Tìm thương hiệu đang được chọn
    const targetBrand = brands.find(b => b.id.toString() === selectedBrand);
    
    // Logic Lọc:
    // 1. Trùng ID thương hiệu (cho các SP mới đã gắn Thương hiệu)
    // 2. Nếu SP chưa gắn Thương hiệu, fallback so khớp Tên Danh Mục = Tên Thương Hiệu (do dữ liệu cũ bị trùng)
    const matchesBrand = selectedBrand === "all" || 
                         (p.brand && p.brand.id.toString() === selectedBrand) || 
                         (!p.brand && p.category && targetBrand && p.category.name.toUpperCase() === targetBrand.name.toUpperCase());
                         
    const matchesPrice = p.price >= minPrice && p.price <= maxPrice;
    
    return matchesSearch && matchesBrand && matchesPrice;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f1f5f9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="font-black text-slate-400 uppercase text-xs tracking-[0.3em] italic">Hệ thống đang sẵn sàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] animate-fadeIn font-sans italic">
      
      {/* 1. BANNER SLIDER */}
      <div className="max-w-7xl mx-auto py-8 px-4">
        <Swiper
          spaceBetween={20}
          centeredSlides={true}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          modules={[Autoplay, Pagination, Navigation]}
          className="rounded-[3.5rem] shadow-2xl overflow-hidden border-8 border-white group"
        >
          {banners.map((banner) => (
            <SwiperSlide key={banner.id}>
              <div className="relative h-[250px] sm:h-[400px] md:h-[550px]">
                <img 
                  src={banner.url} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                  alt={banner.title} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent flex items-end p-12">
                  <div className="max-w-2xl">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-widest mb-4 inline-block shadow-lg italic">New Arrival</span>
                    <h2 className="text-white text-4xl md:text-6xl font-black tracking-tighter uppercase drop-shadow-2xl italic leading-none">
                        {banner.title}
                    </h2>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* 2. BỘ LỌC ĐA TẦNG (HÃNG & GIÁ) */}
      <div className="max-w-7xl mx-auto px-8 mb-16 space-y-6">
        {/* Bộ lọc Hãng */}
        <div className="bg-white/70 backdrop-blur-xl p-5 rounded-[3rem] shadow-sm flex flex-col md:flex-row justify-between items-center border border-white/50 gap-6 italic">
          <div className="flex items-center gap-3 ml-4">
              <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
              <p className="text-slate-800 font-black text-sm uppercase tracking-tighter italic">Bộ lọc thương hiệu</p>
          </div>
          <div className="flex gap-3 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-hide">
            <button 
              onClick={() => setSelectedBrand("all")}
              className={`px-10 py-4 rounded-2xl font-black text-[11px] uppercase transition-all whitespace-nowrap shadow-sm italic ${
                selectedBrand === "all" ? 'bg-slate-900 text-white shadow-xl shadow-slate-200' : 'bg-white text-slate-400 hover:bg-slate-50'
              }`}
            >
              Tất cả
            </button>
            {brands.map(brand => (
              <button 
                key={brand.id}
                onClick={() => setSelectedBrand(brand.id.toString())}
                className={`px-8 py-3 rounded-2xl font-black text-[11px] uppercase transition-all whitespace-nowrap shadow-sm italic flex items-center gap-3 ${
                  selectedBrand === brand.id.toString() ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'bg-white text-slate-500 hover:bg-slate-50'
                }`}
              >
                {brand.logoUrl && (
                  <img 
                    src={brand.logoUrl} 
                    alt={brand.name} 
                    className="w-6 h-6 object-contain"
                  />
                )}
                {brand.name}
              </button>
            ))}
          </div>
        </div>

        {/* Bộ lọc Giá tiền */}
        <div className="bg-white/70 backdrop-blur-xl p-6 rounded-[3rem] shadow-sm flex flex-col md:flex-row items-center border border-white/50 gap-6 italic">
          <div className="flex items-center gap-3 ml-4 md:w-1/4">
              <span className="w-2 h-8 bg-pink-500 rounded-full"></span>
              <p className="text-slate-800 font-black text-sm uppercase tracking-tighter italic">Lọc theo mức giá</p>
          </div>
          <div className="flex-1 w-full px-4 flex flex-col gap-4">
            
            {/* Thanh trượt Min Price */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 w-12">TỪ</span>
              <input 
                type="range" 
                min="0" 
                max="50000000" 
                step="1000000" 
                value={minPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val <= maxPrice) setMinPrice(val);
                }}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <span className="text-[11px] font-black text-blue-600 bg-blue-50 px-4 py-2 rounded-xl whitespace-nowrap min-w-[140px] text-center uppercase tracking-widest">
                {minPrice.toLocaleString()}đ
              </span>
            </div>

            {/* Thanh trượt Max Price */}
            <div className="flex items-center gap-4">
              <span className="text-xs font-black text-slate-400 w-12">ĐẾN</span>
              <input 
                type="range" 
                min="0" 
                max="50000000" 
                step="1000000" 
                value={maxPrice}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val >= minPrice) setMaxPrice(val);
                }}
                className="flex-1 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
              />
              <span className="text-[11px] font-black text-pink-600 bg-pink-50 px-4 py-2 rounded-xl whitespace-nowrap min-w-[140px] text-center uppercase tracking-widest">
                {maxPrice.toLocaleString()}đ
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* 3. DANH SÁCH SẢN PHẨM */}
      <div className="max-w-7xl mx-auto px-8 min-h-[600px]">
        <div className="flex items-center gap-6 mb-12 italic">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter uppercase italic">
            {searchTerm ? `🔎 Kết quả cho: "${searchTerm}"` : "📱 Flagship mới về"}
          </h2>
          <div className="h-1 flex-1 bg-slate-200 rounded-full opacity-30"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-32 bg-white rounded-[4rem] shadow-inner border-4 border-dashed border-slate-100 italic">
            <p className="text-slate-300 font-black text-2xl uppercase tracking-tighter italic">Không có sản phẩm nào phù hợp...</p>
          </div>
        )}
      </div>

      {/* 4. FOOTER */}
      <footer className="mt-32 bg-white border-t border-slate-100 rounded-t-[5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.03)] italic">
        <div className="max-w-7xl mx-auto px-10 py-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1">
              <h3 className="text-3xl font-black text-blue-600 tracking-tighter mb-8 italic">MOBITECH</h3>
              <p className="text-slate-400 text-sm font-bold leading-relaxed uppercase tracking-tight italic">
                Hệ thống bán lẻ điện thoại cao cấp. Trải nghiệm mua sắm công nghệ đỉnh cao với dịch vụ hậu mãi số 1.
              </p>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 italic">Dịch vụ</h4>
              <ul className="space-y-4 text-xs font-black text-slate-400 uppercase tracking-widest italic">
                <li className="hover:text-blue-600 cursor-pointer transition-all">Bảo hành VIP 12 tháng</li>
                <li className="hover:text-blue-600 cursor-pointer transition-all">Thu cũ đổi mới</li>
                <li className="hover:text-blue-600 cursor-pointer transition-all">Giao hàng siêu tốc</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 italic">Liên hệ</h4>
              <ul className="space-y-4 text-xs font-black text-slate-400 uppercase tracking-widest italic">
                <li>📞 0332068220</li>
                <li>📧 hao01679462492@gmail.com</li>
                <li>📍 Đồng Nai, Định Quán</li>
              </ul>
            </div>

            <div>
              <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.3em] mb-8 italic">Mạng xã hội</h4>
              <div className="flex gap-4">
                <button className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-sm">FB</button>
                <button className="w-12 h-12 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center hover:bg-pink-600 hover:text-white transition-all shadow-sm">IG</button>
                <button className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center hover:bg-blue-800 transition-all shadow-sm font-black text-[10px] italic">ZALO</button>
              </div>
            </div>
          </div>

          <div className="mt-20 pt-10 border-t border-slate-50 text-center italic">
            <p className="text-[10px] font-black text-slate-200 uppercase tracking-[0.5em] italic">
              © 2026 MOBITECH STORE - SMARTPHONE RETAIL SYSTEM
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}