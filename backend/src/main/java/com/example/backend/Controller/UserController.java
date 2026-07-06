package com.example.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.User;
import com.example.backend.Entity.Order;
import com.example.backend.Entity.Wishlist;
import com.example.backend.Repository.UserRepository;
import com.example.backend.Repository.OrderRepository;
import com.example.backend.Repository.WishlistRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173") // Cho phép Frontend truy cập
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private BCryptPasswordEncoder encoder;

    // 1. LẤY DANH SÁCH TẤT CẢ NGƯỜI DÙNG (Sửa lỗi GET 404 khi load trang)
    @GetMapping
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    // 2. CẬP NHẬT THÔNG TIN NGƯỜI DÙNG (Cho nút Sửa)
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return userRepository.findById(id).map(user -> {
            user.setFullName(userDetails.getFullName());
            user.setPhone(userDetails.getPhone());
            user.setEmail(userDetails.getEmail());
            user.setAddress(userDetails.getAddress());
            user.setAvatar(userDetails.getAvatar());
            
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 3. XÓA NGƯỜI DÙNG (Cho nút Xóa)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            // 1. Gỡ bỏ liên kết với các Đơn hàng (Giữ lại lịch sử đơn hàng để thống kê)
            List<Order> orders = orderRepository.findByUserIdOrderByIdDesc(id);
            if (orders != null && !orders.isEmpty()) {
                for (Order order : orders) {
                    order.setUser(null);
                    orderRepository.save(order);
                }
            }

            // 2. Xóa tất cả sản phẩm trong Wishlist của người dùng này
            List<Wishlist> wishlists = wishlistRepository.findByUserId(id);
            if (wishlists != null && !wishlists.isEmpty()) {
                wishlistRepository.deleteAll(wishlists);
            }

            // 3. Xóa user
            userRepository.delete(user);
            return ResponseEntity.ok(Map.of("message", "Đã xóa khách hàng thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. ĐỔI MẬT KHẨU
    @PutMapping("/{id}/password")
    public ResponseEntity<?> changePassword(@PathVariable Long id, @RequestBody Map<String, String> passwords) {
        String oldPassword = passwords.get("oldPassword");
        String newPassword = passwords.get("newPassword");

        return userRepository.findById(id).map(user -> {
            if (!encoder.matches(oldPassword, user.getPassword())) {
                return ResponseEntity.badRequest().body(Map.of("message", "Mật khẩu cũ không chính xác!"));
            }
            user.setPassword(encoder.encode(newPassword));
            userRepository.save(user);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công!"));
        }).orElse(ResponseEntity.notFound().build());
    }
}