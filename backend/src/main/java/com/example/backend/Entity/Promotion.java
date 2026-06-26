package com.example.backend.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@Table(name = "promotions")
public class Promotion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Mã nhập (VD: MUAHE2026)
    @Column(unique = true, nullable = false)
    private String code;

    // Tên chương trình (VD: Siêu Sale Chào Hè)
    private String name;

    // Loại giảm giá: "PERCENT" (Phần trăm) hoặc "FIXED" (Số tiền)
    private String discountType;

    // Giá trị giảm (VD: 10% hoặc 500000đ)
    private Double discountValue;

    // Đơn hàng tối thiểu để áp dụng (VD: Mua trên 5.000.000đ mới được dùng)
    private Double minOrderValue;

    // Ngày bắt đầu và kết thúc
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Giới hạn số lượt dùng và số lượt đã dùng
    private Integer usageLimit;
    private Integer usedCount = 0;

    // Trạng thái: 1 = Đang chạy, 0 = Tạm dừng
    private Integer status = 1;

    // 1 = Hiển thị công khai cho khách thấy, 0 = Ẩn (Chỉ dùng nội bộ/Gửi riêng)
    @Column(name = "is_public", columnDefinition = "integer default 1")
    private Integer isPublic = 1;
}