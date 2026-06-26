package com.example.backend.Controller;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.Order;
import com.example.backend.Entity.Product;
import com.example.backend.Entity.Promotion;
import com.example.backend.Repository.OrderRepository;
import com.example.backend.Repository.ProductRepository;
import com.example.backend.Repository.PromotionRepository; 
import com.example.backend.Service.EmailService;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*") 
public class OrderController {

    @Autowired
    private OrderRepository orderRepo;

    @Autowired
    private ProductRepository productRepo;

    // THÊM: Gọi PromotionRepository để xử lý trừ lượt dùng Voucher
    @Autowired
    private PromotionRepository promotionRepo;

    @Autowired
    private EmailService emailService;

    // API: Lấy tất cả đơn hàng (Admin Dashboard)
    @GetMapping
    public List<Order> getAllOrders() {
        return orderRepo.findAllByOrderByIdDesc();
    }

    // API: Lấy đơn hàng theo User ID (Khách hàng xem lịch sử)
    @GetMapping("/user/{userId}")
    public List<Order> getOrdersByUserId(@PathVariable Long userId) {
        return orderRepo.findByUserIdOrderByIdDesc(userId);
    }

    // API: Admin duyệt đơn hàng
    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateOrderStatus(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newStatus = payload.get("status");
        return orderRepo.findById(id).map(order -> {
            String oldStatus = order.getStatus();
            
            // NẾU CHUYỂN TỪ TRẠNG THÁI KHÁC SANG CANCELLED -> HOÀN LẠI KHO VÀ VOUCHER
            if ("CANCELLED".equals(newStatus) && !"CANCELLED".equals(oldStatus)) {
                if (order.getDetails() != null) {
                    // Gom nhóm số lượng theo Product ID để tránh ghi đè nếu đơn hàng có nhiều màu của cùng 1 sản phẩm
                    java.util.Map<Long, Integer> productQuantities = new java.util.HashMap<>();
                    order.getDetails().forEach(detail -> {
                        Long productId = detail.getProduct().getId();
                        productQuantities.put(productId, productQuantities.getOrDefault(productId, 0) + detail.getQuantity());
                    });
                    
                    productQuantities.forEach((productId, qty) -> {
                        Product product = productRepo.findById(productId).orElse(null);
                        if (product != null) {
                            int currentStock = product.getStock() == null ? 0 : product.getStock();
                            product.setStock(currentStock + qty);
                            productRepo.save(product);
                        }
                    });
                }
                
                // Hoàn lại lượt dùng Voucher
                if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                    Promotion promo = promotionRepo.findByCode(order.getPromoCode()).orElse(null);
                    if (promo != null) {
                        int currentUsed = promo.getUsedCount() == null ? 0 : promo.getUsedCount();
                        if (currentUsed > 0) {
                            promo.setUsedCount(currentUsed - 1);
                            promotionRepo.save(promo);
                        }
                    }
                }
            } 
            // NẾU CHUYỂN TỪ CANCELLED SANG TRẠNG THÁI KHÁC -> TRỪ LẠI KHO VÀ VOUCHER
            else if (!"CANCELLED".equals(newStatus) && "CANCELLED".equals(oldStatus)) {
                if (order.getDetails() != null) {
                    java.util.Map<Long, Integer> productQuantities = new java.util.HashMap<>();
                    order.getDetails().forEach(detail -> {
                        Long productId = detail.getProduct().getId();
                        productQuantities.put(productId, productQuantities.getOrDefault(productId, 0) + detail.getQuantity());
                    });
                    
                    productQuantities.forEach((productId, qty) -> {
                        Product product = productRepo.findById(productId).orElse(null);
                        if (product != null) {
                            int currentStock = product.getStock() == null ? 0 : product.getStock();
                            product.setStock(currentStock - qty);
                            productRepo.save(product);
                        }
                    });
                }
                
                // Trừ lại lượt dùng Voucher
                if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                    Promotion promo = promotionRepo.findByCode(order.getPromoCode()).orElse(null);
                    if (promo != null) {
                        int currentUsed = promo.getUsedCount() == null ? 0 : promo.getUsedCount();
                        promo.setUsedCount(currentUsed + 1);
                        promotionRepo.save(promo);
                    }
                }
            }

            order.setStatus(newStatus); 
            orderRepo.save(order);
            return ResponseEntity.ok(Map.of("message", "Cập nhật thành công"));
        }).orElse(ResponseEntity.notFound().build());
    }

    // API: Khách hàng hủy đơn 
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelOrder(@PathVariable Long id) {
        return orderRepo.findById(id).map(order -> {
            if ("PENDING".equals(order.getStatus())) {
                order.setStatus("CANCELLED");
                
                // --- NGHIỆP VỤ HOÀN KHO KHI KHÁCH HỦY ĐƠN ---
                if (order.getDetails() != null) {
                    java.util.Map<Long, Integer> productQuantities = new java.util.HashMap<>();
                    order.getDetails().forEach(detail -> {
                        Long productId = detail.getProduct().getId();
                        productQuantities.put(productId, productQuantities.getOrDefault(productId, 0) + detail.getQuantity());
                    });
                    
                    productQuantities.forEach((productId, qty) -> {
                        Product product = productRepo.findById(productId).orElse(null);
                        if (product != null) {
                            int currentStock = product.getStock() == null ? 0 : product.getStock();
                            product.setStock(currentStock + qty); // Cộng lại kho
                            productRepo.save(product);
                        }
                    });
                }
                
                // --- HOÀN LẠI VOUCHER KHI KHÁCH HỦY ĐƠN ---
                if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                    Promotion promo = promotionRepo.findByCode(order.getPromoCode()).orElse(null);
                    if (promo != null) {
                        int currentUsed = promo.getUsedCount() == null ? 0 : promo.getUsedCount();
                        if (currentUsed > 0) {
                            promo.setUsedCount(currentUsed - 1);
                            promotionRepo.save(promo);
                        }
                    }
                }

                orderRepo.save(order);
                return ResponseEntity.ok(Map.of("message", "Hủy đơn thành công và đã hoàn lại kho"));
            }
            return ResponseEntity.badRequest().body("Chỉ có thể hủy đơn hàng đang chờ duyệt");
        }).orElse(ResponseEntity.notFound().build());
    }
    
    // API: TẠO ĐƠN HÀNG MỚI (CHECKOUT)
    @PostMapping
    public ResponseEntity<?> createOrder(@RequestBody Order order) {
        try {
            // 0. Gom nhóm số lượng theo Product ID để kiểm tra và trừ kho chính xác
            java.util.Map<Long, Integer> productQuantities = new java.util.HashMap<>();
            if (order.getDetails() != null) {
                for (var detail : order.getDetails()) {
                    Long productId = detail.getProduct().getId();
                    productQuantities.put(productId, productQuantities.getOrDefault(productId, 0) + detail.getQuantity());
                }
            }

            // 1. Kiểm tra kho trước khi cho phép đặt hàng
            for (Map.Entry<Long, Integer> entry : productQuantities.entrySet()) {
                Product product = productRepo.findById(entry.getKey())
                        .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại!"));
                
                int currentStock = product.getStock() == null ? 0 : product.getStock();
                
                // Nếu tổng số lượng mua lớn hơn số tồn kho -> Báo lỗi ngay lập tức
                if (entry.getValue() > currentStock) {
                    return ResponseEntity.badRequest().body("Sản phẩm '" + product.getName() + "' chỉ còn " + currentStock + " máy trong kho. Không đủ để đặt hàng!");
                }
            }

            // 2. Kiểm tra và gắn User để tránh cột user_id bị NULL trong DB
            if (order.getUser() != null && order.getUser().getId() != null) {
                System.out.println("Gắn đơn hàng cho User ID: " + order.getUser().getId());
                
                // Kiểm tra xem User này đã dùng mã khuyến mãi này chưa
                if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                    boolean hasUsed = orderRepo.existsByUserIdAndPromoCodeAndStatusNot(order.getUser().getId(), order.getPromoCode(), "CANCELLED");
                    if (hasUsed) {
                        return ResponseEntity.badRequest().body("Bạn đã sử dụng mã khuyến mãi này rồi! Mỗi người chỉ được dùng 1 lần.");
                    }
                }
            }

            // 3. Thiết lập quan hệ hai chiều và THỰC HIỆN TRỪ KHO
            if (order.getDetails() != null) {
                for (var detail : order.getDetails()) {
                    detail.setOrder(order);
                    // Lấy Product từ DB gán vào detail để email lấy được tên sản phẩm
                    if (detail.getProduct() != null && detail.getProduct().getId() != null) {
                        Product p = productRepo.findById(detail.getProduct().getId()).orElse(null);
                        if (p != null) {
                            detail.setProduct(p);
                        }
                    }
                }
            }
            
            // Trừ kho dùng dữ liệu đã gom nhóm
            productQuantities.forEach((productId, qty) -> {
                Product product = productRepo.findById(productId).get();
                int currentStock = product.getStock() == null ? 0 : product.getStock();
                product.setStock(currentStock - qty); // Trừ đi tổng số lượng khách mua
                productRepo.save(product); // Cập nhật lại số lượng mới vào DB
            });

            // 4. LƯU ĐƠN HÀNG
            Order savedOrder = orderRepo.save(order);

            // 5. NGHIỆP VỤ KHUYẾN MÃI: Tăng số lượt sử dụng nếu khách có dùng mã
            if (order.getPromoCode() != null && !order.getPromoCode().trim().isEmpty()) {
                Promotion promo = promotionRepo.findByCode(order.getPromoCode()).orElse(null);
                if (promo != null) {
                    int currentUsed = promo.getUsedCount() == null ? 0 : promo.getUsedCount();
                    promo.setUsedCount(currentUsed + 1); // Tăng lượt dùng lên 1
                    promotionRepo.save(promo);
                }
            }

            // 6. GỬI EMAIL THÔNG BÁO CHO KHÁCH HÀNG
            if (order.getEmail() != null && !order.getEmail().trim().isEmpty()) {
                // Chạy ngầm trong Thread khác để không làm chậm quá trình đặt hàng
                new Thread(() -> {
                    emailService.sendOrderConfirmationEmail(order.getEmail(), order.getFullname(), savedOrder);
                }).start();
            }

            return ResponseEntity.ok(savedOrder);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi đặt hàng: " + e.getMessage());
        }
    }
}