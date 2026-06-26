package com.example.backend.Controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.Promotion;
import com.example.backend.Repository.OrderRepository;
import com.example.backend.Repository.PromotionRepository;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin(origins = "*")
public class PromotionController {

    @Autowired
    private PromotionRepository promotionRepo;

    @Autowired
    private OrderRepository orderRepo;

    @GetMapping
    public List<Promotion> getAllPromotions() {
        return promotionRepo.findAll();
    }

    @PostMapping
    public ResponseEntity<?> createPromotion(@RequestBody Promotion promotion) {
        return ResponseEntity.ok(promotionRepo.save(promotion));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePromotion(@PathVariable Long id, @RequestBody Promotion promoDetails) {
        return promotionRepo.findById(id).map(promo -> {
            promo.setCode(promoDetails.getCode());
            promo.setName(promoDetails.getName());
            promo.setDiscountType(promoDetails.getDiscountType());
            promo.setDiscountValue(promoDetails.getDiscountValue());
            promo.setMinOrderValue(promoDetails.getMinOrderValue());
            promo.setStartDate(promoDetails.getStartDate());
            promo.setEndDate(promoDetails.getEndDate());
            promo.setUsageLimit(promoDetails.getUsageLimit());
            promo.setStatus(promoDetails.getStatus());
            
            // THÊM DÒNG NÀY ĐỂ LƯU TRẠNG THÁI HIỂN THỊ
            promo.setIsPublic(promoDetails.getIsPublic()); 
            
            return ResponseEntity.ok(promotionRepo.save(promo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        return promotionRepo.findById(id).map(promo -> {
            promo.setStatus(promo.getStatus() == 1 ? 0 : 1);
            return ResponseEntity.ok(promotionRepo.save(promo));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePromotion(@PathVariable Long id) {
        promotionRepo.deleteById(id);
        return ResponseEntity.ok("Đã xóa mã khuyến mãi");
    }
    // API: Khách hàng kiểm tra mã giảm giá
    @GetMapping("/check")
    public ResponseEntity<?> checkPromotion(@RequestParam String code, @RequestParam Double orderTotal, @RequestParam(required = false) Long userId) {
        Promotion promo = promotionRepo.findByCode(code).orElse(null);
        
        if (promo == null) {
            return ResponseEntity.badRequest().body("Mã khuyến mãi không tồn tại!");
        }
        if (promo.getStatus() == 0) {
            return ResponseEntity.badRequest().body("Mã này đã bị tạm dừng!");
        }
        if (promo.getUsedCount() >= promo.getUsageLimit()) {
            return ResponseEntity.badRequest().body("Rất tiếc, mã này đã hết lượt sử dụng!");
        }
        
        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(promo.getStartDate()) || now.isAfter(promo.getEndDate())) {
            return ResponseEntity.badRequest().body("Mã không nằm trong thời gian áp dụng!");
        }
        
        if (orderTotal < promo.getMinOrderValue()) {
            return ResponseEntity.badRequest().body("Đơn hàng phải từ " + promo.getMinOrderValue() + "đ để áp dụng mã này!");
        }

        if (userId != null) {
            boolean hasUsed = orderRepo.existsByUserIdAndPromoCodeAndStatusNot(userId, code, "CANCELLED");
            if (hasUsed) {
                return ResponseEntity.badRequest().body("Bạn đã sử dụng mã này rồi! Mỗi người chỉ được dùng 1 lần.");
            }
        }

        // Nếu qua hết các ải trên -> Mã hợp lệ, trả thông tin mã về cho ReactJS tính tiền
        return ResponseEntity.ok(promo);
    }
}