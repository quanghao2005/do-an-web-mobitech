import { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard() {
  // Lưu trữ toàn bộ dữ liệu gốc từ DB
  const [allRawOrders, setAllRawOrders] = useState([]);
  const [allRawImports, setAllRawImports] = useState([]); // THÊM STATE LƯU PHIẾU NHẬP
  const [totalStock, setTotalStock] = useState(0); // THÊM STATE LƯU TỔNG KHO
  const [loading, setLoading] = useState(true);
  
  // Bộ lọc thời gian (Mặc định là 7 ngày qua)
  const [timeRange, setTimeRange] = useState('7days');

  // State hiển thị trên giao diện
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalOrders: 0,
    newCustomers: 0,
    totalImportCost: 0,
    profit: 0
  });
  const [chartData, setChartData] = useState({ labels: [], datasets: [] });

  // 1. GỌI API LẤY TOÀN BỘ DỮ LIỆU KHI LOAD TRANG (Đã thêm gọi API Products)
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Gọi song song 3 API: Đơn hàng, Sản phẩm, Phiếu nhập
      const [resOrders, resProducts, resImports] = await Promise.all([
        axios.get("http://localhost:8080/api/orders"),
        axios.get("http://localhost:8080/api/products"),
        axios.get("http://localhost:8080/api/imports")
      ]);

      // Xử lý dữ liệu Đơn hàng
      const orders = Array.isArray(resOrders.data) ? resOrders.data : [];
      setAllRawOrders(orders);

      // Xử lý dữ liệu Kho (Cộng dồn tất cả stock của sản phẩm)
      const products = Array.isArray(resProducts.data) ? resProducts.data : [];
      const stock = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      setTotalStock(stock);

      // Xử lý dữ liệu Phiếu nhập kho
      const imports = Array.isArray(resImports.data) ? resImports.data : [];
      setAllRawImports(imports);

    } catch (err) {
      console.error("Lỗi lấy dữ liệu Dashboard:", err);
      setAllRawOrders([]);
    } finally {
      setLoading(false);
    }
  };

  // 2. XỬ LÝ LỌC DỮ LIỆU MỖI KHI ĐỔI BỘ LỌC THỜI GIAN
  useEffect(() => {
    if (allRawOrders.length === 0) return;

    const now = new Date();
    // Chỉ lấy đơn thành công
    const validOrders = allRawOrders.filter(o => o.status !== 'CANCELLED' && o.status !== 'PENDING');
    
    let filteredOrders = [];
    let filteredImports = [];
    let labels = [];
    let dailyRevenueMap = {};

    // --- LOGIC CHO TỪNG BỘ LỌC ---
    if (timeRange === 'today') {
      const todayStr = now.toLocaleDateString('vi-VN');
      filteredOrders = validOrders.filter(o => new Date(o.createdAt).toLocaleDateString('vi-VN') === todayStr);
      filteredImports = allRawImports.filter(i => new Date(i.importDate).toLocaleDateString('vi-VN') === todayStr);
      labels = ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'];
      labels.forEach(l => dailyRevenueMap[l] = 0);
      
      filteredOrders.forEach(order => {
        const hour = new Date(order.createdAt).getHours();
        const bucket = Math.floor(hour / 4) * 4;
        const bucketStr = `${bucket.toString().padStart(2, '0')}:00`;
        if(dailyRevenueMap[bucketStr] !== undefined) dailyRevenueMap[bucketStr] += (Number(order.total) || 0);
      });

    } else if (timeRange === '7days') {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const dStr = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        labels.push(dStr);
        dailyRevenueMap[dStr] = 0;
      }
      const cutoffDate = new Date(now);
      cutoffDate.setDate(now.getDate() - 6);
      cutoffDate.setHours(0, 0, 0, 0);
      
      filteredOrders = validOrders.filter(o => new Date(o.createdAt) >= cutoffDate);
      filteredImports = allRawImports.filter(i => new Date(i.importDate) >= cutoffDate);
      filteredOrders.forEach(order => {
        const dStr = new Date(order.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        if(dailyRevenueMap[dStr] !== undefined) dailyRevenueMap[dStr] += (Number(order.total) || 0);
      });

    } else if (timeRange === 'month') {
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      labels = ['Tuần 1', 'Tuần 2', 'Tuần 3', 'Tuần 4'];
      labels.forEach(l => dailyRevenueMap[l] = 0);
      
      filteredOrders = validOrders.filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      filteredImports = allRawImports.filter(i => {
        const d = new Date(i.importDate);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });
      filteredOrders.forEach(order => {
        const date = new Date(order.createdAt).getDate();
        let week = 'Tuần 1';
        if (date > 7 && date <= 14) week = 'Tuần 2';
        else if (date > 14 && date <= 21) week = 'Tuần 3';
        else if (date > 21) week = 'Tuần 4';
        dailyRevenueMap[week] += (Number(order.total) || 0);
      });

    } else if (timeRange === 'year') {
      const currentYear = now.getFullYear();
      labels = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
      labels.forEach(l => dailyRevenueMap[l] = 0);
      
      filteredOrders = validOrders.filter(o => new Date(o.createdAt).getFullYear() === currentYear);
      filteredImports = allRawImports.filter(i => new Date(i.importDate).getFullYear() === currentYear);
      filteredOrders.forEach(order => {
        const month = new Date(order.createdAt).getMonth() + 1;
        const mStr = `T${month}`;
        if(dailyRevenueMap[mStr] !== undefined) dailyRevenueMap[mStr] += (Number(order.total) || 0);
      });
    }

    // --- CẬP NHẬT GIAO DIỆN ---
    setChartData({
      labels: labels,
      datasets: [{
        label: 'Doanh thu (VNĐ)',
        data: labels.map(label => dailyRevenueMap[label]),
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        hoverBackgroundColor: '#1d4ed8'
      }]
    });

    const revenue = filteredOrders.reduce((sum, order) => sum + (Number(order.total) || 0), 0);
    const uniqueCustomers = new Set(filteredOrders.map(o => o.phone).filter(p => p)).size;
    const importCost = filteredImports.reduce((sum, item) => sum + (Number(item.totalPrice) || 0), 0);

    setStats({
      totalRevenue: revenue,
      totalOrders: filteredOrders.length,
      newCustomers: uniqueCustomers,
      totalImportCost: importCost,
      profit: revenue - importCost
    });

  }, [allRawOrders, timeRange]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN') + " " + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse italic">Đang tải dữ liệu vận hành...</p>
    </div>
  );

  return (
    <div className="animate-fadeIn p-4 bg-[#f8f9fa] min-h-screen font-sans italic">
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>

      {/* HEADER */}
      <div className="mb-10 flex justify-between items-end px-4">
        <div>
            <h2 className="text-4xl font-black text-slate-800 tracking-tighter uppercase italic">Trung tâm điều hành</h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 italic">Dữ liệu kinh doanh thời gian thực</p>
        </div>
        <button onClick={fetchDashboardData} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all active:scale-95 group">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-blue-600 transition-colors">🔄 Làm mới dữ liệu</span>
        </button>
      </div>

      {/* THAY ĐỔI GRID Ở ĐÂY: Mở rộng thành 5 cột, biểu đồ chiếm 2 cột */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-8 mb-12">
        
        {/* THẺ DOANH THU & BIỂU ĐỒ (Chiếm 2 cột trên màn hình lớn) */}
        <div className="xl:col-span-2 bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col h-[400px] transition-all hover:shadow-xl hover:shadow-blue-900/5">
          <div className="flex justify-between items-center mb-8 italic">
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Biến động doanh thu</span>
            <div className="relative">
              <select 
                className="appearance-none text-[10px] font-black text-blue-600 bg-blue-50 pl-4 pr-8 py-2.5 rounded-xl italic outline-none cursor-pointer hover:bg-blue-100 transition-colors uppercase tracking-widest shadow-inner"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="today">Hôm nay</option>
                <option value="7days">7 Ngày qua</option>
                <option value="month">Tháng này</option>
                <option value="year">Năm nay</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-blue-600">
                <svg className="fill-current h-3 w-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1">
            {chartData.labels.length > 0 ? (
              <Bar 
                data={chartData} 
                options={{ 
                  responsive: true, 
                  maintainAspectRatio: false, 
                  plugins: { legend: { display: false } },
                  scales: { 
                    y: { display: false }, 
                    x: { grid: { display: false }, border: { display: false }, ticks: { font: { weight: 'bold', size: 10 } } } 
                  }
                }} 
              />
            ) : <p className="text-center text-slate-300 text-xs py-20 italic">Chưa có dữ liệu biểu đồ</p>}
          </div>
          <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-end italic">
              <span className="text-[10px] font-black text-slate-400 uppercase">Doanh thu tổng</span>
              <p className="text-3xl font-black text-blue-600 tracking-tighter italic">{stats.totalRevenue.toLocaleString()}đ</p>
          </div>
        </div>

        {/* THẺ ĐƠN HÀNG THÀNH CÔNG */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center items-center text-center group hover:bg-slate-900 transition-all duration-500 italic">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner group-hover:bg-blue-600 group-hover:text-white transition-colors">📦</div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-slate-500">Đơn hàng nhận được</span>
            {/* Giảm cỡ chữ xuống text-5xl và thêm toLocaleString() */}
            <h3 className="text-4xl xl:text-5xl font-black text-slate-900 mt-2 tracking-tighter group-hover:text-white italic">{stats.totalOrders.toLocaleString()}</h3>
            <p className="text-[8px] text-blue-500 font-black mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">TRONG KHOẢNG THỜI GIAN TRÊN</p>
        </div>

        {/* THẺ KHÁCH HÀNG */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center items-center text-center group hover:bg-blue-600 transition-all duration-500 italic">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner group-hover:bg-white group-hover:text-blue-600 transition-colors">👥</div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-blue-100">Khách hàng tin dùng</span>
            <h3 className="text-4xl xl:text-5xl font-black text-slate-900 mt-2 tracking-tighter group-hover:text-white italic">{stats.newCustomers.toLocaleString()}</h3>
            <p className="text-[8px] text-white font-black mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">TRONG KHOẢNG THỜI GIAN TRÊN</p>
        </div>

        {/* THẺ KHO HÀNG */}
        <div className="bg-white p-8 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center items-center text-center group hover:bg-orange-500 transition-all duration-500 italic">
            <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center text-2xl mb-4 shadow-inner group-hover:bg-white group-hover:text-orange-600 transition-colors">🏪</div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-orange-100">Tổng sản phẩm kho</span>
            <h3 className="text-4xl xl:text-5xl font-black text-slate-900 mt-2 tracking-tighter group-hover:text-white italic">{totalStock.toLocaleString()}</h3>
            <p className="text-[8px] text-white font-black mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity italic">SẴN SÀNG KINH DOANH</p>
        </div>
      </div>

      {/* THÊM KHU VỰC THỐNG KÊ TÀI CHÍNH LỢI NHUẬN */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* THẺ VỐN NHẬP KHO */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center items-center text-center group hover:bg-red-500 transition-all duration-500 italic relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-9xl opacity-5 group-hover:opacity-20 transition-opacity">💸</div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-red-100 z-10">Tổng vốn nhập kho</span>
            <h3 className="text-5xl font-black text-slate-900 mt-4 tracking-tighter group-hover:text-white italic z-10">{stats.totalImportCost.toLocaleString()}đ</h3>
            <p className="text-[10px] text-red-300 font-black mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-10">CHI PHÍ ĐẦU TƯ</p>
        </div>

        {/* THẺ LỢI NHUẬN */}
        <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-50 flex flex-col justify-center items-center text-center group hover:bg-green-500 transition-all duration-500 italic relative overflow-hidden">
            <div className="absolute -right-6 -top-6 text-9xl opacity-5 group-hover:opacity-20 transition-opacity">📈</div>
            <span className="text-xs font-black uppercase text-slate-400 tracking-[0.2em] group-hover:text-green-100 z-10">Lợi nhuận ròng</span>
            <h3 className="text-5xl font-black text-slate-900 mt-4 tracking-tighter group-hover:text-white italic z-10">{stats.profit.toLocaleString()}đ</h3>
            <p className="text-[10px] text-green-200 font-black mt-4 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity z-10">LỢI NHUẬN = DOANH THU - VỐN</p>
        </div>
      </div>

      {/* DANH SÁCH LỊCH SỬ TẤT CẢ ĐƠN HÀNG */}
      <div className="bg-white p-10 rounded-[4rem] shadow-sm border border-slate-50 mb-10">
        <div className="flex justify-between items-center mb-10 italic">
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-4">
               <span className="w-2 h-8 bg-blue-600 rounded-full"></span>
               Lịch sử đặt hàng
            </h3>
            <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-5 py-2.5 rounded-2xl uppercase tracking-widest shadow-sm">
                Toàn bộ {allRawOrders.length} giao dịch
            </span>
        </div>

        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-4 custom-scrollbar">
          {allRawOrders.length > 0 ? allRawOrders.map((order) => (
            <div 
              key={order.id} 
              className="flex items-center justify-between p-6 bg-slate-50/50 rounded-[2.5rem] border border-transparent hover:border-blue-200 hover:bg-white hover:shadow-xl transition-all duration-500 cursor-pointer group"
            >
              <div className="flex items-center gap-6">
                <div className={`font-black w-14 h-14 flex items-center justify-center rounded-2xl shadow-sm border border-slate-100 transition-all text-lg italic ${
                  order.status === 'CANCELLED' ? 'bg-red-50 text-red-500' : 'bg-white text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                }`}>
                  #{order.id}
                </div>
                <div>
                  <p className="font-black text-slate-800 uppercase text-sm tracking-tight italic">{order.fullname}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                    {order.phone} <span className="mx-2 opacity-30">|</span> {formatDateTime(order.createdAt)}
                  </p>
                </div>
              </div>
              <div className="text-right flex items-center gap-10 italic">
                <div>
                  <p className={`font-black text-xl italic ${order.status === 'CANCELLED' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                    {order.total?.toLocaleString()}đ
                  </p>
                  <span className={`text-[9px] font-black uppercase px-3 py-1 rounded-lg mt-1 inline-block italic ${
                    order.status === 'PENDING' ? 'bg-amber-100 text-amber-600' : 
                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {order.status === 'PENDING' ? 'Chờ duyệt' : 
                     order.status === 'CANCELLED' ? 'Đã hủy' : 'Đã duyệt'}
                  </span>
                </div>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-slate-300 font-bold uppercase text-xs italic">Chưa có dữ liệu giao dịch</div>
          )}
        </div>
      </div>
    </div>
  );
}