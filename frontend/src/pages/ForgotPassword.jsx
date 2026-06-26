import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
export default function ForgotPassword() {
    const [form, setForm] = useState({ username: '', phone: '', newPassword: '' });
    const navigate = useNavigate();
    const handleReset = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/forgot-password', form);
            alert("✅ " + res.data.message);
            navigate('/login');
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi: " + (err.response?.data?.message || "Tên đăng nhập hoặc số điện thoại không đúng"));
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans italic">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[420px] border border-slate-50 animate-fadeIn italic">
                
                <div className="text-center mb-10 italic">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full italic">Khôi Phục</span>
                    <h2 className="text-3xl font-black text-slate-900 mt-6 tracking-tighter uppercase italic">Quên Mật Khẩu</h2>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest italic">Nhập thông tin xác minh</p>
                </div>
                <form onSubmit={handleReset} className="space-y-6 italic">
                    <div className="space-y-2 italic">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Tài khoản</label>
                        <input 
                            className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                            placeholder="Nhập username của bạn..." 
                            onChange={e => setForm({...form, username: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2 italic">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Số điện thoại</label>
                        <input 
                            className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                            placeholder="Số điện thoại đã đăng ký..." 
                            onChange={e => setForm({...form, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div className="space-y-2 italic">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Mật khẩu mới</label>
                        <input 
                            className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                            type="password" 
                            placeholder="Nhập mật khẩu mới..." 
                            onChange={e => setForm({...form, newPassword: e.target.value})}
                            required
                        />
                    </div>
                    <button className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-slate-200 transition-all active:scale-[0.96] mt-4 uppercase text-[11px] tracking-[0.2em] italic">
                        Đặt Lại Mật Khẩu →
                    </button>
                </form>
                <div className="mt-10 text-center text-[10px] font-black uppercase tracking-widest italic">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="text-slate-900 hover:text-blue-600 underline underline-offset-4 decoration-2 transition-colors italic"
                    >
                        ← Quay lại Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}
