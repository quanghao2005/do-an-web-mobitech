import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ForgotPassword() {
    const [step, setStep] = useState(1);
    const [form, setForm] = useState({ username: '', email: '', otp: '', newPassword: '', confirmPassword: '' });
    const navigate = useNavigate();

    const handleRequestOTP = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:8080/api/auth/forgot-password', {
                username: form.username,
                email: form.email
            });
            alert("✅ " + res.data.message);
            setStep(2);
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi: " + (err.response?.data?.message || "Tên đăng nhập hoặc email không đúng"));
        }
    };

    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        
        if (form.newPassword !== form.confirmPassword) {
            alert("❌ Lỗi: Mật khẩu xác nhận không khớp!");
            return;
        }

        try {
            const res = await axios.post('http://localhost:8080/api/auth/verify-otp', {
                username: form.username,
                otp: form.otp,
                newPassword: form.newPassword
            });
            
            const data = res.data;
            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.role);
            localStorage.setItem('userId', data.id);
            localStorage.setItem('username', data.username);
            localStorage.setItem('fullName', data.fullName || "Người dùng"); 
            localStorage.setItem('avatar', data.avatar || ""); 
            localStorage.setItem('phone', data.phone || "Chưa cập nhật");
            localStorage.setItem('email', data.email || "");
            localStorage.setItem('address', data.address || "Chưa cập nhật");
            localStorage.setItem('user', JSON.stringify({
                id: data.id,
                fullName: data.fullName,
                email: data.email,
                avatar: data.avatar,
                role: data.role
            }));
            
            alert("✅ Đăng nhập bằng OTP thành công!");
            if (data.role === 'ADMIN') {
                window.location.href = '/admin'; 
            } else {
                window.location.href = '/'; 
            }
        } catch (err) {
            console.error(err);
            alert("❌ Lỗi: " + (err.response?.data?.message || "Mã OTP không hợp lệ hoặc đã hết hạn"));
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f8fafc] font-sans italic">
            <div className="bg-white p-10 rounded-[3rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[420px] border border-slate-50 animate-fadeIn italic">
                
                <div className="text-center mb-10 italic">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full italic">
                        {step === 1 ? "Khôi Phục" : "Xác Thực"}
                    </span>
                    <h2 className="text-3xl font-black text-slate-900 mt-6 tracking-tighter uppercase italic">
                        {step === 1 ? "Quên Mật Khẩu" : "Nhập Mã OTP"}
                    </h2>
                    <p className="text-slate-400 text-xs mt-2 font-bold uppercase tracking-widest italic">
                        {step === 1 ? "Xác minh tài khoản qua email" : "Kiểm tra hòm thư của bạn"}
                    </p>
                </div>

                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-6 italic animate-fadeIn">
                        <div className="space-y-2 italic">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Tài khoản</label>
                            <input 
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                                placeholder="Nhập username của bạn..." 
                                value={form.username}
                                onChange={e => setForm({...form, username: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2 italic">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic">Email Đã Đăng Ký</label>
                            <input 
                                type="email"
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                                placeholder="example@gmail.com..." 
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-slate-200 transition-all active:scale-[0.96] mt-4 uppercase text-[11px] tracking-[0.2em] italic">
                            Gửi mã xác nhận →
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="space-y-6 italic animate-fadeIn">
                        <div className="space-y-2 italic text-center mb-4">
                            <p className="text-sm font-bold text-slate-600 italic">Mã OTP gồm 6 chữ số đã được gửi tới:</p>
                            <p className="text-sm font-black text-blue-600 italic">{form.email}</p>
                        </div>
                        <div className="space-y-2 italic">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic text-center block">Mã OTP (6 Số)</label>
                            <input 
                                type="text"
                                maxLength={6}
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-center text-3xl font-black tracking-[0.3em] text-slate-800 italic placeholder:text-slate-300" 
                                placeholder="------" 
                                value={form.otp}
                                onChange={e => setForm({...form, otp: e.target.value.replace(/\D/g, '')})}
                                required
                            />
                        </div>
                        <div className="space-y-2 italic">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic block">Mật khẩu mới</label>
                            <input 
                                type="password"
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                                placeholder="Nhập mật khẩu mới..." 
                                value={form.newPassword}
                                onChange={e => setForm({...form, newPassword: e.target.value})}
                                required
                            />
                        </div>
                        <div className="space-y-2 italic">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 italic block">Xác nhận mật khẩu</label>
                            <input 
                                type="password"
                                className="w-full p-5 bg-slate-50 border-none rounded-2xl outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white transition-all duration-300 text-sm font-bold italic" 
                                placeholder="Nhập lại mật khẩu..." 
                                value={form.confirmPassword}
                                onChange={e => setForm({...form, confirmPassword: e.target.value})}
                                required
                            />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-6 rounded-[2rem] shadow-xl shadow-blue-200 transition-all active:scale-[0.96] mt-4 uppercase text-[11px] tracking-[0.2em] italic">
                            Đổi mật khẩu & Đăng nhập
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-black py-4 rounded-[2rem] transition-all active:scale-[0.96] mt-2 uppercase text-[10px] tracking-[0.2em] italic">
                            Quay lại
                        </button>
                    </form>
                )}

                <div className="mt-10 text-center text-[10px] font-black uppercase tracking-widest italic">
                    <button 
                        onClick={() => navigate('/login')} 
                        className="text-slate-900 hover:text-blue-600 underline underline-offset-4 decoration-2 transition-colors italic"
                    >
                        ← Trở về trang Đăng nhập
                    </button>
                </div>
            </div>
        </div>
    );
}
