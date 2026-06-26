package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Promotion;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, Long> {
    // Thêm hàm này vào trong interface PromotionRepository
java.util.Optional<Promotion> findByCode(String code);
}