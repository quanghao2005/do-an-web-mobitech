package com.example.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Order;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    @Query("SELECT o FROM Order o WHERE o.status IN ('APPROVED', 'DELIVERED', 'CONFIRMED')")
List<Order> findSuccessfulOrders();

    // 1. Tìm đơn hàng theo User ID (mới nhất lên đầu)
    List<Order> findByUserIdOrderByIdDesc(Long userId);

    // 2. Tìm danh sách đơn hàng theo số điện thoại
    List<Order> findByPhoneOrderByIdDesc(String phone);

    // 3. Lọc đơn hàng theo trạng thái (Dùng cho Admin lọc đơn PENDING, COMPLETED...)
    List<Order> findByStatus(String status);
    
    // 4. Lấy 1 đơn duy nhất mới nhất theo SĐT (Dùng cho Chatbot)
    Order findFirstByPhoneOrderByIdDesc(String phone);

    // 6. Kiểm tra xem user đã dùng mã khuyến mãi này chưa (chỉ tính các đơn chưa bị hủy)
    boolean existsByUserIdAndPromoCodeAndStatusNot(Long userId, String promoCode, String status);

    /**
     * 5. LẤY TOÀN BỘ ĐƠN HÀNG TRONG HỆ THỐNG
     * Sắp xếp theo ID giảm dần để trang Quản trị hiện đơn mới nhất ở trên cùng thanh cuộn
     */
    List<Order> findAllByOrderByIdDesc();
    
}