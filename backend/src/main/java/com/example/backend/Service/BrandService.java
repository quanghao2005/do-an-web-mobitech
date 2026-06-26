package com.example.backend.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.backend.Entity.Brand;
import com.example.backend.Repository.BrandRepository;

@Service
public class BrandService {

    @Autowired
    private BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(Long id) {
        return brandRepository.findById(id).orElse(null);
    }

    public Brand createBrand(Brand brand) {
        return brandRepository.save(brand);
    }

    public Brand updateBrand(Long id, Brand brandDetails) {
        Brand brand = brandRepository.findById(id).orElse(null);
        if (brand != null) {
            brand.setName(brandDetails.getName());
            brand.setLogoUrl(brandDetails.getLogoUrl());
            return brandRepository.save(brand);
        }
        return null;
    }

    public void deleteBrand(Long id) {
        brandRepository.deleteById(id);
    }
}
