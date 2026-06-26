package com.example.backend.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.Contact;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Long> {
    // Spring Data JPA sẽ tự động tạo các hàm cơ bản: 
    // save(), findAll(), findById(), deleteById(),...
}