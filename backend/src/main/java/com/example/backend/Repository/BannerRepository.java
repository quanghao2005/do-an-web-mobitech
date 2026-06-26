package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Banner;

@Repository
public interface BannerRepository extends JpaRepository<Banner, Long> {
}