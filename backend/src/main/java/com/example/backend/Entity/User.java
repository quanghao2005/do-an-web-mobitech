package com.example.backend.Entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private String fullName; 
    
    @Column(length = 15)
    private String phone;
    
    @Column(columnDefinition = "TEXT") 
    private String address;
    
    @Column(unique = true, nullable = false, length = 50) 
    private String username;
    
    @Column(nullable = false)
    private String password;
    
    @Column(length = 100)
    private String email;
    
    // Mặc định là USER
    @Column(columnDefinition = "VARCHAR(20) DEFAULT 'USER'")
    private String role; 
    
    @Column(columnDefinition = "LONGTEXT") 
    private String avatar;

    // --- BỔ SUNG TRƯỜNG NGÀY TẠO ---
    @CreationTimestamp // Tự động gán ngày giờ khi insert vào DB
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}