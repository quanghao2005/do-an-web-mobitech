package com.example.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.DTO.ImportRequestDTO;
import com.example.backend.Entity.ImportReceipt;
import com.example.backend.Service.ImportService;

@RestController
@RequestMapping("/api/imports")
@CrossOrigin("*") 
public class ImportController {

    @Autowired
    private ImportService importService;

    @PostMapping
    public ResponseEntity<?> createImport(@RequestBody ImportRequestDTO request) {
        try {
            ImportReceipt savedReceipt = importService.createImportReceipt(request);
            return ResponseEntity.ok(savedReceipt);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi nhập kho: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<ImportReceipt>> getAllImports() {
        List<ImportReceipt> imports = importService.getAllImports();
        return ResponseEntity.ok(imports);
    }
}