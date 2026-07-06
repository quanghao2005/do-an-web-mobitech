package com.example.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin; // Đảm bảo đường dẫn này đúng với project của bạn
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.Category;
import com.example.backend.Repository.CategoryRepository;

@RestController
@RequestMapping("/api/categories")
@CrossOrigin("*") // Cho phép React (Port 5173) truy cập vào Spring Boot (Port 8080)
public class CategoryController {

    @Autowired
    private CategoryRepository categoryRepository;

    // 1. Lấy danh sách danh mục (Sửa lỗi GET 404)
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // 2. Thêm mới danh mục (Sửa lỗi POST 404)
    @PostMapping
    public Category createCategory(@RequestBody Category category) {
        return categoryRepository.save(category);
    }

    // 3. Cập nhật danh mục (Sửa lỗi PUT 404)
    @PutMapping("/{id}")
    public Category updateCategory(@PathVariable Long id, @RequestBody Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục với id: " + id));
        category.setName(categoryDetails.getName());
        category.setBrand(categoryDetails.getBrand());
        return categoryRepository.save(category);
    }

    // 4. Xóa danh mục (Sửa lỗi DELETE 404)
    @DeleteMapping("/{id}")
    public void deleteCategory(@PathVariable Long id) {
        categoryRepository.deleteById(id);
    }
}