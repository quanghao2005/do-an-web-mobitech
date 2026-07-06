package com.example.backend.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.Entity.User;
import com.example.backend.Repository.UserRepository;
import com.example.backend.util.JwtUtil;

@Service
public class AuthService {

    @Autowired 
    private UserRepository userRepository;

    @Autowired 
    private BCryptPasswordEncoder encoder;

    @Autowired 
    private JwtUtil jwtUtil;
    
    @Autowired
    private EmailService emailService;

    // LƯU TRỮ OTP TRONG BỘ NHỚ (Thực tế nên dùng Redis)
    private final Map<String, OTPDetails> otpCache = new ConcurrentHashMap<>();

    private static class OTPDetails {
        String otp;
        long expiryTime;
        OTPDetails(String otp, long expiryTime) {
            this.otp = otp;
            this.expiryTime = expiryTime;
        }
    }

    // --- HÀM ĐĂNG KÝ ---
    public User register(User user) {
        // 1. Mã hóa mật khẩu trước khi lưu vào DB
        user.setPassword(encoder.encode(user.getPassword()));
        
        // 2. Mặc định quyền là USER nếu không có
        if (user.getRole() == null) {
            user.setRole("USER");
        }
        
        return userRepository.save(user);
    }

    // --- HÀM ĐĂNG NHẬP ---
    public Map<String, Object> login(String username, String password) {
        // Tìm user trong DB
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // So khớp mật khẩu đã mã hóa
        if (encoder.matches(password, user.getPassword())) {
            // Tạo token JWT
            String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
            
            // Dùng HashMap để gom dữ liệu trả về cho Frontend
            Map<String, Object> response = new HashMap<>();
            
            // LƯU Ý: Phải dùng .put() thay vì .add()
            response.put("token", token);
            response.put("role", user.getRole());
            response.put("username", user.getUsername());
            response.put("fullName", user.getFullName()); // Hiện tên trên Navbar
            response.put("id", user.getId());              // Dùng để update profile
            response.put("phone", user.getPhone());
            response.put("address", user.getAddress());
            response.put("avatar", user.getAvatar());

            return response;
        }
        
        throw new RuntimeException("Mật khẩu không chính xác");
    }

    // --- HÀM QUẢN LÝ MẬT KHẨU ---
    public String resetPassword(String username, String phone, String newPassword) {
        User user = userRepository.findByUsernameAndPhone(username, phone)
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc số điện thoại không đúng"));
        
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        
        return "Mật khẩu đã được đặt lại thành công";
    }

    // --- HÀM TẠO VÀ GỬI OTP ---
    public String generateAndSendOTP(String username, String email) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        if (user.getEmail() == null || !user.getEmail().equals(email)) {
            throw new RuntimeException("Email không khớp với tài khoản này");
        }

        // Tạo mã OTP 6 số ngẫu nhiên
        String otp = String.format("%06d", new Random().nextInt(999999));
        
        // Lưu vào Cache với hạn 5 phút (300,000 ms)
        otpCache.put(username, new OTPDetails(otp, System.currentTimeMillis() + 300000));

        // Gửi qua EmailService
        emailService.sendOTPEmail(email, otp);

        return "Mã OTP đã được gửi đến email của bạn";
    }

    // --- HÀM XÁC THỰC OTP VÀ ĐỔI MẬT KHẨU ---
    public Map<String, Object> verifyOTPAndResetPassword(String username, String otp, String newPassword) {
        OTPDetails details = otpCache.get(username);

        if (details == null) {
            throw new RuntimeException("Mã OTP không hợp lệ hoặc chưa được yêu cầu");
        }

        if (System.currentTimeMillis() > details.expiryTime) {
            otpCache.remove(username); // Xóa mã hết hạn
            throw new RuntimeException("Mã OTP đã hết hạn");
        }

        if (!details.otp.equals(otp)) {
            throw new RuntimeException("Mã OTP không chính xác");
        }

        // OTP đúng -> Xóa khỏi cache
        otpCache.remove(username);

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Tài khoản không tồn tại"));

        // LƯU MẬT KHẨU MỚI
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);

        // Sinh token đăng nhập y hệt hàm login bình thường
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());
        
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("role", user.getRole());
        response.put("username", user.getUsername());
        response.put("fullName", user.getFullName());
        response.put("id", user.getId());
        response.put("phone", user.getPhone());
        response.put("email", user.getEmail());
        response.put("address", user.getAddress());
        response.put("avatar", user.getAvatar());
        response.put("message", "Đổi mật khẩu thành công!");

        return response;
    }
}