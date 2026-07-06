import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function InventoryManagement() {
  const [products, setProducts] = useState([]);
  const [importHistory, setImportHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State cho Modal nhập kho và Modal lịch sử
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [addQuantity, setAddQuantity] = useState("");
  const [importPrice, setImportPrice] = useState("");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const [resProducts, resImports] = await Promise.all([
        axios.get("http://localhost:8080/api/products"),
        axios.get("http://localhost:8080/api/imports")
      ]);
      setProducts(resProducts.data);
      // Sắp xếp lịch sử nhập kho mới nhất lên đầu
      setImportHistory(resImports.data.sort((a, b) => new Date(b.importDate) - new Date(a.importDate)));
    } catch (err) {
      console.error("Lỗi lấy dữ liệu kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setAddQuantity("");
    setImportPrice("");
    setIsModalOpen(true);
  };

  const handleImportStock = async () => {
    if (!addQuantity || isNaN(addQuantity) || Number(addQuantity) <= 0) {
      alert("Vui lòng nhập số lượng hợp lệ!");
      return;
    }
    if (!importPrice || isNaN(importPrice) || Number(importPrice) < 0) {
      alert("Vui lòng nhập giá nhập kho hợp lệ!");
      return;
    }

    try {
      await axios.post("http://localhost:8080/api/imports", {
        productId: selectedProduct.id,
        quantity: parseInt(addQuantity),
        importPrice: parseFloat(importPrice)
      });
      alert(`✅ Nhập thành công ${addQuantity} máy cho ${selectedProduct.name}`);
      setIsModalOpen(false);
      fetchInventory(); // Load lại bảng
    } catch (err) {
      alert("Lỗi khi nhập kho! Vui lòng thử lại.");
      console.error(err);
    }
  };

  if (loading) return <div className="p-10 text-center font-black italic text-slate-400">Đang tải dữ liệu kho...</div>;

  // Tính toán thống kê nhanh
  const totalItemsInStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
  const lowStockItems = products.filter(p => (p.stock || 0) < 5 && (p.stock || 0) > 0).length;
  const outOfStockItems = products.filter(p => (p.stock || 0) === 0).length;

  return (
    <div className="animate-fadeIn p-4 bg-[#f8f9fa] min-h-screen font-sans italic">
      <div className="mb-10 px-4 flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Quản lý Kho hàng</h2>
          <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Kiểm soát tồn kho thời gian thực</p>
        </div>
        <button 
          onClick={() => setIsHistoryModalOpen(true)}
          className="bg-blue-600 text-white px-8 py-4 rounded-[2rem] font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-slate-900 transition-all italic flex items-center gap-2"
        >
          <span className="text-lg">🕒</span> Lịch sử nhập kho
        </button>
      </div>

      {/* THẺ THỐNG KÊ KHO */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">📦</div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Tổng máy trong kho</p>
               <p className="text-4xl font-black text-slate-800 tracking-tighter italic">{totalItemsInStock}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6">
            <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Sắp hết hàng (&lt; 5 máy)</p>
               <p className="text-4xl font-black text-orange-500 tracking-tighter italic">{lowStockItems}</p>
            </div>
         </div>
         <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-50 flex items-center gap-6">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl">🚫</div>
            <div>
               <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Hết hàng (0 máy)</p>
               <p className="text-4xl font-black text-red-500 tracking-tighter italic">{outOfStockItems}</p>
            </div>
         </div>
      </div>

      {/* BẢNG DỮ LIỆU KHO */}
      <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-100">
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Sản phẩm</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Giá bán</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Tồn kho</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Trạng thái</th>
                <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => {
                const stock = product.stock || 0;
                let statusBadge = <span className="bg-green-100 text-green-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Còn hàng</span>;
                if (stock === 0) statusBadge = <span className="bg-red-100 text-red-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest animate-pulse">Hết hàng</span>;
                else if (stock < 5) statusBadge = <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest">Sắp hết</span>;

                return (
                  <tr key={product.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 flex items-center gap-4">
                      <img src={product.imageUrl} alt="img" className="w-14 h-14 object-contain bg-white rounded-xl border border-slate-100 p-1" />
                      <span className="font-black text-slate-800 uppercase text-sm tracking-tight">{product.name}</span>
                    </td>
                    <td className="py-6 text-center font-bold text-slate-500">{product.price?.toLocaleString()}đ</td>
                    <td className="py-6 text-center">
                      <span className={`text-xl font-black ${stock === 0 ? 'text-red-500' : 'text-slate-800'}`}>{stock}</span>
                    </td>
                    <td className="py-6 text-center">{statusBadge}</td>
                    <td className="py-6 text-right">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg"
                      >
                        + Nhập kho
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* LỊCH SỬ NHẬP KHO (MODAL) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn p-4">
          <div className="bg-white w-full max-w-4xl p-10 rounded-[3rem] shadow-2xl animate-slideUp italic relative">
            <button 
              onClick={() => setIsHistoryModalOpen(false)} 
              className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center font-bold text-slate-500 hover:bg-red-500 hover:text-white transition-all z-10"
            >
              ✕
            </button>
            
            <style>{`
              .custom-scrollbar::-webkit-scrollbar { width: 4px; }
              .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
            `}</style>
            
            <div className="flex justify-between items-center mb-10 italic pr-16">
                <h3 className="text-2xl md:text-3xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
                   <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
                   Lịch sử nhập kho
                </h3>
                <span className="text-[10px] font-black bg-blue-50 text-blue-600 px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-sm">
                    {importHistory.length} Giao dịch nhập
                </span>
            </div>

            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
              {importHistory.map((receipt) => (
                <div key={receipt.id} className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-500 group">
                  <div className="flex items-center gap-6">
                    <img src={receipt.product?.imageUrl} alt="img" className="w-14 h-14 object-contain bg-white rounded-xl border border-slate-100 p-1" />
                    <div>
                      <p className="font-black text-slate-800 uppercase text-sm tracking-tight italic">{receipt.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                        Phiếu #{receipt.id} <span className="mx-2 opacity-30">|</span> {new Date(receipt.importDate).toLocaleDateString('vi-VN')} {new Date(receipt.importDate).toLocaleTimeString('vi-VN', {hour: '2-digit', minute: '2-digit'})}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-10 italic">
                    <div className="hidden md:block">
                      <p className="font-black text-xl text-slate-800 italic">
                        +{receipt.quantity} <span className="text-xs text-slate-400">máy</span>
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">
                        Giá nhập: {receipt.importPrice?.toLocaleString()}đ
                      </p>
                    </div>
                    <div className="w-32 text-right">
                       <p className="font-black text-xl text-red-500 italic">
                        -{receipt.totalPrice?.toLocaleString()}đ
                      </p>
                      <p className="text-[9px] font-black text-red-400 mt-1 uppercase tracking-widest bg-red-50 rounded-lg py-1 px-2 inline-block">Tổng vốn</p>
                    </div>
                  </div>
                </div>
              ))}
              {importHistory.length === 0 && (
                <div className="text-center py-20 text-slate-300 font-bold uppercase text-xs italic">Chưa có lịch sử nhập kho</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL NHẬP KHO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
          <div className="bg-white w-[450px] p-10 rounded-[3rem] shadow-2xl animate-slideUp italic">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">Nhập Hàng</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-red-500 font-bold">✕</button>
            </div>
            
            <div className="mb-6 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-1">Sản phẩm</p>
              <p className="font-black text-slate-800 uppercase">{selectedProduct?.name}</p>
              <p className="text-xs text-blue-600 font-bold mt-1">Tồn kho hiện tại: {selectedProduct?.stock || 0} máy</p>
            </div>

            <div className="mb-4">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block mb-3">Số lượng cần nhập thêm</label>
              <input 
                type="number" 
                min="1"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 py-4 text-xl font-black text-slate-800 outline-none focus:border-blue-600 focus:bg-blue-50 transition-all text-center"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                placeholder="VD: 50"
              />
            </div>

            <div className="mb-8">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-2 block mb-3">Giá nhập (VNĐ/máy)</label>
              <input 
                type="number" 
                min="0"
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2rem] px-6 py-4 text-xl font-black text-slate-800 outline-none focus:border-blue-600 focus:bg-blue-50 transition-all text-center"
                value={importPrice}
                onChange={(e) => setImportPrice(e.target.value)}
                placeholder="VD: 10000000"
              />
            </div>

            <button 
              onClick={handleImportStock}
              className="w-full bg-blue-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-slate-900 transition-colors shadow-xl"
            >
              Xác nhận Nhập Kho
            </button>
          </div>
        </div>
      )}
    </div>
  );
}