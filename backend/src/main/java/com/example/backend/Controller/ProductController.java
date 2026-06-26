package com.example.backend.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

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

import com.example.backend.Entity.Category;
import com.example.backend.Entity.Product;
import com.example.backend.Repository.CategoryRepository;
import com.example.backend.Repository.ProductRepository;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*") 
public class ProductController {

    @Autowired private ProductRepository productRepository;
    @Autowired private CategoryRepository categoryRepository;

    // 1. LẤY TẤT CẢ SẢN PHẨM (Admin)
    @GetMapping
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // 2. LẤY SẢN PHẨM ĐANG HIỂN THỊ (Khách hàng)
    @GetMapping("/active")
    public List<Product> getActiveProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getStatus() == 1)
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @GetMapping("/categories")
    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    // 4. THÊM MỚI SẢN PHẨM
    @PostMapping
    public ResponseEntity<?> addProduct(@RequestBody Product product) {
        try {
            if (product.getStatus() == 0) product.setStatus(1); 
            return ResponseEntity.ok(productRepository.save(product));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi: " + e.getMessage());
        }
    }

    // 5. CẬP NHẬT SẢN PHẨM (Đã sửa lỗi lưu Giá cũ, Tồn kho và thêm cấu hình Chip)
    @PutMapping("/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product productDetails) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + id));
        
        // --- 1. Thông tin cơ bản, Giá & Kho ---
        product.setName(productDetails.getName());
        product.setPrice(productDetails.getPrice());
        
        // CẬP NHẬT GIÁ CŨ: Để hiển thị gạch ngang giảm giá
        product.setOldPrice(productDetails.getOldPrice()); 

        // QUAN TRỌNG: Lưu số lượng tồn kho vào Database (Sửa lỗi mất dữ liệu kho)
        product.setStock(productDetails.getStock()); 

        product.setDescription(productDetails.getDescription());
        product.setImageUrl(productDetails.getImageUrl());
        product.setCategory(productDetails.getCategory());
        product.setBrand(productDetails.getBrand());
        product.setStatus(productDetails.getStatus());

        // --- 2. Cấu hình & BỘ NHỚ ---
        // QUAN TRỌNG: Lưu danh sách tùy chọn dung lượng (JSON) để khách hàng chọn
        product.setRamOptions(productDetails.getRamOptions()); 
        
        product.setOs(productDetails.getOs());
        
        // CHI TIẾT CON CHIP (SoC)
        product.setCpu(productDetails.getCpu()); // Chip xử lý (VD: Snapdragon 8 Gen 3)
        product.setGpu(productDetails.getGpu()); // THÊM MỚI: Chip đồ họa (VD: Adreno 750)
        
        product.setRam(productDetails.getRam());
        product.setStorage(productDetails.getStorage());

        // --- 3. Camera & Màn hình ---
        product.setScreen(productDetails.getScreen());
        product.setScreenTech(productDetails.getScreenTech());
        product.setCamera(productDetails.getCamera());
        product.setSelfie(productDetails.getSelfie());

        // --- 4. Pin & Sạc ---
        product.setBattery(productDetails.getBattery());
        product.setBatteryType(productDetails.getBatteryType());
        product.setCharging(productDetails.getCharging());

        // --- 5. Tiện ích & Biến thể ---
        product.setSecurity(productDetails.getSecurity());
        product.setColorVariants(productDetails.getColorVariants());
        
        return ResponseEntity.ok(productRepository.save(product));
    }

    // 6. API THAY ĐỔI TRẠNG THÁI NHANH (ẨN/HIỆN)
    @PutMapping("/{id}/toggle-status")
    public ResponseEntity<?> toggleStatus(@PathVariable Long id) {
        return productRepository.findById(id).map(product -> {
            int newStatus = (product.getStatus() == 1) ? 0 : 1;
            product.setStatus(newStatus);
            productRepository.save(product);
            return ResponseEntity.ok(Map.of(
                "message", "Đã " + (newStatus == 1 ? "hiển thị" : "ẩn") + " thành công",
                "status", newStatus
            ));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 7. XÓA SẢN PHẨM (Đã thêm Try-Catch để báo lỗi chi tiết như Khóa ngoại)
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteProduct(@PathVariable Long id) {
        try {
            if (!productRepository.existsById(id)) {
                return ResponseEntity.status(404).body("Không tìm thấy sản phẩm id: " + id);
            }
            productRepository.deleteById(id);
            return ResponseEntity.ok("Đã xóa sản phẩm thành công");
        } catch (Exception e) {
            // Trả về lỗi 500 kèm lý do (ví dụ: đang có đơn hàng liên kết nên không được xóa)
            return ResponseEntity.status(500).body("Không thể xóa do: " + e.getMessage());
        }
    }
    // 8. API NHẬP KHO (QUẢN LÝ TỒN KHO) - Bản tối ưu
    @PutMapping("/{id}/add-stock")
    public ResponseEntity<?> addStock(@PathVariable Long id, @RequestParam int quantity) {
        try {
            Product product = productRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm id: " + id));
            
            // Xử lý an toàn trường hợp stock là null
            int currentStock = (product.getStock() == null) ? 0 : product.getStock();
            product.setStock(currentStock + quantity);
            
            productRepository.save(product);
            
            return ResponseEntity.ok(Map.of(
                "message", "Đã nhập thêm " + quantity + " sản phẩm vào kho.",
                "newStock", product.getStock()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi nhập kho: " + e.getMessage());
        }
    }
}