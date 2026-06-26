import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/login', credentials);
            const data = res.data; // Giả định server trả về đầy đủ object UserDTO

            // 1. Lưu các thông tin định danh cơ bản vào LocalStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            
            // 2. Lưu thông tin hiển thị đồng bộ với Navbar
            localStorage.setItem('fullName', data.fullName || "Người dùng"); 
            localStorage.setItem('avatar', data.avatar || ""); // Ảnh Base64 hoặc URL
            localStorage.setItem('phone', data.phone || "Chưa cập nhật");
            localStorage.setItem('address', data.address || "Chưa cập nhật");
            
            // 3. Lưu object tổng thể để các tính năng khác dễ truy xuất
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                fullName: data.fullName,
                avatar: data.avatar,
                role: data.role
            }));
            
            // 4. Chuyển hướng sử dụng href để đảm bảo toàn bộ App nhận được storage mới
            if (data.role === 'ADMIN') {
                window.location.href = '/admin'; 
            } else {
                window.location.href = '/'; 
            }
            
        } catch (err) {
            console.error(err);
            alert("❌ Đăng nhập thất bại! Vui lòng kiểm tra lại tài khoản hoặc mật khẩu.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans italic">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[420px] border border-slate-50 animate-fadeIn italic">
                
                <div className="text-center mb-10 italic">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full italic">Welcome Back</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-6 tracking-tighter uppercase italic">Chào mừng trở lại</h2>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest italic">Hệ thống Mobitech sẵn sàng</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 italic">
                    <div className="space-y-2 italic">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Tài khoản</label>
                        <input 
                            className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                            placeholder="Nhập username của bạn..." 
                            onChange={e => setCredentials({...credentials, username: e.target.value})}
                            required
                        />
                    </div>

                    <div className="space-y-2 italic">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Mật khẩu</label>
                        <input 
                            className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                            type="password" 
                            placeholder="••••••••" 
                            onChange={e => setCredentials({...credentials, password: e.target.value})}
                            required
                        />
                    </div>

                    <button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-slate-200 transition-all active:scale-[0.96] mt-4 uppercase text-[11px] tracking-[0.2em] italic">
                        Xác nhận đăng nhập →
                    </button>
                    
                    <div className="text-right mt-2">
                        <button type="button" onClick={() => navigate('/forgot-password')} className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest italic transition-colors">
                            Quên mật khẩu?
                        </button>
                    </div>
                </form>

                <div className="mt-10 text-center text-[10px] font-black uppercase tracking-widest italic">
                    <span className="text-slate-300">Chưa có tài khoản? </span>
                    <button 
                        onClick={() => navigate('/register')} 
                        className="text-slate-900 hover:text-blue-600 underline underline-offset-4 decoration-2 transition-colors italic"
                    >
                        Đăng ký thành viên
                    </button>
                </div>
            </div>
        </div>
    );
}