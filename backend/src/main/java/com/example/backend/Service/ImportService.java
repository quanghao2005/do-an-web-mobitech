package com.example.backend.Service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.DTO.ImportRequestDTO;
import com.example.backend.Entity.ImportReceipt;
import com.example.backend.Entity.Product;
import com.example.backend.Repository.ImportReceiptRepository;
import com.example.backend.Repository.ProductRepository;

@Service
public class ImportService {

    @Autowired
    private ImportReceiptRepository importReceiptRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional 
    public ImportReceipt createImportReceipt(ImportRequestDTO request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm với ID: " + request.getProductId()));

        ImportReceipt receipt = new ImportReceipt();
        receipt.setProduct(product);
        receipt.setQuantity(request.getQuantity());
        receipt.setImportPrice(request.getImportPrice());
        
        BigDecimal total = request.getImportPrice().multiply(new BigDecimal(request.getQuantity()));
        receipt.setTotalPrice(total);

        // LƯU Ý: Nếu Entity Product của bạn lưu tồn kho bằng biến "quantity" thay vì "stock", 
        // hãy sửa chữ getStock() thành getQuantity() và setStock() thành setQuantity() ở 2 dòng dưới đây nhé:
        int currentStock = product.getStock() != null ? product.getStock() : 0;
        product.setStock(currentStock + request.getQuantity());
        
        productRepository.save(product); 
        return importReceiptRepository.save(receipt); 
    }

    public List<ImportReceipt> getAllImports() {
        return importReceiptRepository.findAll();
    }
}