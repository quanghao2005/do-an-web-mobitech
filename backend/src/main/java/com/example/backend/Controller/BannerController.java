package com.example.backend.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.Entity.Banner;
import com.example.backend.Repository.BannerRepository;

@RestController
@RequestMapping("/api/banners")
@CrossOrigin("*")
public class BannerController {

    @Autowired
    private BannerRepository bannerRepository;

    // Lấy danh sách banner cho trang chủ và trang admin
    @GetMapping
    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    // Lưu banner mới
    @PostMapping
    public Banner createBanner(@RequestBody Banner banner) {
        return bannerRepository.save(banner);
    }

    // Cập nhật banner (thay ảnh hoặc đổi tiêu đề)
    @PutMapping("/{id}")
public Banner updateBanner(@PathVariable Long id, @RequestBody Banner bannerDetails) {
    return bannerRepository.findById(id).map(banner -> {
        // Chỉ cập nhật nếu trường đó có dữ liệu (tránh bị null đè lên dữ liệu cũ)
        if (bannerDetails.getUrl() != null && !bannerDetails.getUrl().isEmpty()) {
            banner.setUrl(bannerDetails.getUrl());
        }
        if (bannerDetails.getTitle() != null) {
            banner.setTitle(bannerDetails.getTitle());
        }
        return bannerRepository.save(banner);
    }).orElseThrow(() -> new RuntimeException("Không tìm thấy banner"));
}

    // Xóa banner
    @DeleteMapping("/{id}")
    public void deleteBanner(@PathVariable Long id) {
        bannerRepository.deleteById(id);
    }
}