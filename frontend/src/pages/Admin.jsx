import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Import các Component con
import AdminDashboard from "./AdminDashboard"; 
import AdminProduct from "./AdminProduct"; 
import AdminOrder from "./AdminOrder";
import AdminCustomer from "./AdminCustomer";
import AdminCategory from "./AdminCategory";
import AdminBanner from "./AdminBanner";
import AdminReview from "./AdminReview";
import AdminContact from "./AdminContact"; 
import AdminPromotion from "./AdminPromotion"; 
import AdminSetting from "./AdminSetting";
import InventoryManagement from "./InventoryManagement";
import AdminBrand from "./AdminBrand";
import AdminTopic from "./AdminTopic";
import AdminPost from "./AdminPost";

export default function Admin() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const adminName = localStorage.getItem("username") || "Quản trị viên";
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    const titles = {
      dashboard: "Tổng quan",
      products: "Sản phẩm",
      categories: "Danh mục",
      brands: "Thương hiệu",
      topics: "Chủ đề bài viết",
      posts: "Bài viết",
      order: "Đơn hàng",
      customers: "Khách hàng",
      banners: "Banner",
      reviews: "Đánh giá",
      contacts: "Hỗ trợ khách hàng", 
      promo: "Khuyến mãi",
      inventory: "Quản lý Kho",
      settings: "Cài đặt"
    };
    document.title = `Admin - ${titles[activeTab] || "PhoneStore"}`;
  }, [activeTab]);

  const handleLogout = () => {
    if (window.confirm("Bạn có chắc chắn muốn đăng xuất khỏi hệ thống quản trị?")) {
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const menuClass = (tabName) => `
    w-full text-left px-5 py-4 rounded-2xl font-bold transition-all flex items-center gap-3 mb-1 italic
    ${activeTab === tabName 
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 scale-[1.02]' 
      : 'text-slate-400 hover:text-white hover:bg-slate-800'}
  `;

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex font-sans italic">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
      
      {/* SIDEBAR */}
      <aside className="w-72 bg-slate-900 p-8 flex flex-col text-white sticky top-0 h-screen shadow-2xl z-20 italic">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-blue-400 tracking-tighter italic">ADMIN CENTER</h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1 mb-6 italic">Mobitech Management</p>
          
          <button onClick={() => navigate("/")} className="w-full flex items-center justify-center gap-2 py-3 bg-slate-800 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:bg-blue-600 transition-all group italic">
            <span className="transition-transform group-hover:-translate-x-1">←</span> Về trang bán hàng
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar italic">
          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4 ml-2 italic">Dữ liệu kinh doanh</p>
          <button onClick={() => setActiveTab("dashboard")} className={menuClass("dashboard")}>
            <span className="text-lg">📊</span> Tổng quan
          </button>
          <button onClick={() => setActiveTab("order")} className={menuClass("order")}>
            <span className="text-lg">📦</span> Đơn hàng
          </button>

          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] my-6 ml-2 italic">Quản lý kho & nội dung</p>
          <button onClick={() => setActiveTab("products")} className={menuClass("products")}>
            <span className="text-lg">📱</span> Sản phẩm
          </button>
          <button onClick={() => setActiveTab("inventory")} className={menuClass("inventory")}>
            <span className="text-lg">🏭</span> Nhập kho
          </button>
          <button onClick={() => setActiveTab("categories")} className={menuClass("categories")}>
            <span className="text-lg">📁</span> Danh mục
          </button>
          <button onClick={() => setActiveTab("brands")} className={menuClass("brands")}>
            <span className="text-lg">🏷️</span> Thương hiệu
          </button>
          <button onClick={() => setActiveTab("topics")} className={menuClass("topics")}>
            <span className="text-lg">📚</span> Chủ đề Bài viết
          </button>
          <button onClick={() => setActiveTab("posts")} className={menuClass("posts")}>
            <span className="text-lg">📰</span> Bài viết
          </button>
          <button onClick={() => setActiveTab("banners")} className={menuClass("banners")}>
            <span className="text-lg">🖼️</span> Banner
          </button>

          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] my-6 ml-2 italic">Khách hàng & Cộng đồng</p>
          <button onClick={() => setActiveTab("customers")} className={menuClass("customers")}>
            <span className="text-lg">👥</span> Khách hàng
          </button>
          <button onClick={() => setActiveTab("reviews")} className={menuClass("reviews")}>
            <span className="text-lg">⭐</span> Đánh giá
          </button>
          
          <button onClick={() => setActiveTab("contacts")} className={menuClass("contacts")}>
            <span className="text-lg">🎧</span> Hỗ trợ & Liên hệ
          </button>

          <p className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] my-6 ml-2 italic">Hệ thống (Sắp có)</p>
          {/* NÚT KHUYẾN MÃI ĐÃ HOẠT ĐỘNG */}
          <button onClick={() => setActiveTab("promo")} className={menuClass("promo")}>
            <span className="text-lg">🎟️</span> Khuyến mãi
          </button>
          <button onClick={() => setActiveTab("settings")} className={menuClass("settings")}>
            <span className="text-lg">⚙️</span> Cài đặt
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800 italic">
            <div className="flex items-center gap-3 mb-6 px-2 italic">
                <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-blue-400 rounded-full flex items-center justify-center font-black text-white shadow-lg shrink-0 uppercase italic">
                    {adminName.charAt(0)}
                </div>
                <div className="overflow-hidden italic">
                    <p className="text-xs font-black text-white uppercase truncate italic">{adminName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase italic">Administrator</p>
                </div>
            </div>
            <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 text-red-500 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all border border-red-500/20 active:scale-95 italic">
              Đăng xuất hệ thống
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto bg-[#f8fafc] italic">
        <div className="max-w-7xl mx-auto animate-fadeIn italic">
          {/* Render Component theo Tab */}
          {activeTab === "dashboard" && <AdminDashboard />}
          {activeTab === "products" && <AdminProduct />}
          {activeTab === "inventory" && <InventoryManagement />}
          {activeTab === "order" && <AdminOrder />}
          {activeTab === "categories" && <AdminCategory />}
          {activeTab === "brands" && <AdminBrand />}
          {activeTab === "topics" && <AdminTopic />}
          {activeTab === "posts" && <AdminPost />}
          {activeTab === "customers" && <AdminCustomer />}
          {activeTab === "banners" && <AdminBanner />}
          {activeTab === "reviews" && <AdminReview />}
          {activeTab === "contacts" && <AdminContact />}
          {activeTab === "promo" && <AdminPromotion />}
          {activeTab === "settings" && <AdminSetting />}
          
          {/* Màn hình trống cho Tab dự phòng */}
          {[] /* Không còn tab trống */ .includes(activeTab) && (
            <div className="flex flex-col items-center justify-center py-40 bg-white rounded-[3rem] border border-dashed border-slate-200 italic">
               <span className="text-6xl mb-6 italic">🚀</span>
               <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter italic">Tính năng đang phát triển</h2>
               <p className="text-slate-400 font-bold text-sm mt-2 italic">Vui lòng quay lại sau!</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}