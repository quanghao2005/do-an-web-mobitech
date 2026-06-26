package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Category;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
}