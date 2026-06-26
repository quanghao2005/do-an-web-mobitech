package com.example.backend.Entity;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data 
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;
    
    // Giá bán hiện tại
    private Double price;
    
    // Giá gốc trước khi giảm
    @Column(name = "old_price") 
    private Double oldPrice;
    
    @Column(columnDefinition = "LONGTEXT")
    private String description;
    
    @Column(columnDefinition = "LONGTEXT")
    private String imageUrl; 
    
    @Column(columnDefinition = "LONGTEXT")
    private String colorVariants; 

    @Column(columnDefinition = "LONGTEXT")
    private String ramOptions; 

    // --- Cấu hình kỹ thuật ---
    private String os;
    private String cpu;
    
    // THÊM MỚI: Chip đồ họa (GPU)
    private String gpu; 
    
    private String ram;
    private String storage;
    private String screen;
    private String screenTech;
    private String camera;
    private String selfie;
    private String battery;
    private String batteryType;
    private String charging;
    private String security;

    // 1 = Hiển thị, 0 = Ẩn
    @Column(name = "status", columnDefinition = "integer default 1")
    private Integer status = 1; 

    // Thời gian khởi tạo
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    @ManyToOne 
    @JoinColumn(name = "category_id")
    private Category category;

    // THÊM MỚI: Liên kết với Thương hiệu (Brand)
    @ManyToOne
    @JoinColumn(name = "brand_id")
    private Brand brand;

    // --- QUẢN LÝ KHO HÀNG ---
    // Sử dụng Integer (viết hoa) để tránh lỗi NULL từ Database
    @Column(name = "stock", columnDefinition = "integer default 0")
    private Integer stock = 0; 
    
    // Getter/Setter thủ công cho status nếu cần
    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }
}