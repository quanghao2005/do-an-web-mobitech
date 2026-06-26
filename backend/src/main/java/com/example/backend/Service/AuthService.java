package com.example.backend.Service;

import java.util.HashMap;
import java.util.Map;

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

    // --- HÀM QUÊN MẬT KHẨU ---
    public String resetPassword(String username, String phone, String newPassword) {
        User user = userRepository.findByUsernameAndPhone(username, phone)
                .orElseThrow(() -> new RuntimeException("Tên đăng nhập hoặc số điện thoại không đúng"));
        
        user.setPassword(encoder.encode(newPassword));
        userRepository.save(user);
        
        return "Mật khẩu đã được đặt lại thành công";
    }
}