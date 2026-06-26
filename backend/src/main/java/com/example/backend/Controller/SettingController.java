package com.example.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.DTO.SettingDTO;
import com.example.backend.Entity.Setting;
import com.example.backend.Service.SettingService;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin("*")
public class SettingController {

    @Autowired
    private SettingService settingService;

    @GetMapping
    public ResponseEntity<List<Setting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @PutMapping
    public ResponseEntity<?> updateSettings(@RequestBody List<SettingDTO> settings) {
        try {
            settingService.updateSettings(settings);
            return ResponseEntity.ok("Cập nhật cấu hình thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi khi cập nhật cấu hình: " + e.getMessage());
        }
    }
}