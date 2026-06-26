package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.ImportReceipt;

@Repository
public interface ImportReceiptRepository extends JpaRepository<ImportReceipt, Long> {
}