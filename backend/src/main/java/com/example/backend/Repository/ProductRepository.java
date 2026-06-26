package com.example.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Product;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    // Lấy danh sách sản phẩm đang kinh doanh (dành cho khách hàng)
    List<Product> findByStatus(int status);

    // Tìm kiếm sản phẩm đang kinh doanh theo tên
    List<Product> findByNameContainingAndStatus(String name, int status);
}