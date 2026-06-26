package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Brand;

@Repository
public interface BrandRepository extends JpaRepository<Brand, Long> {
}
