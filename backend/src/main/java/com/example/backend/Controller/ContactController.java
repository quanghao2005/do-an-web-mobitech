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

import com.example.backend.Entity.Contact;
import com.example.backend.Repository.ContactRepository;

@RestController
@RequestMapping("/api/contacts")
@CrossOrigin(origins = "*")
public class ContactController {

    @Autowired 
    private ContactRepository contactRepository;

    // 1. Lưu lời nhắn từ khách hàng
    @PostMapping
    public ResponseEntity<?> sendContact(@RequestBody Contact contact) {
        try {
            return ResponseEntity.ok(contactRepository.save(contact));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Lỗi hệ thống: " + e.getMessage());
        }
    }

    // 2. Lấy danh sách lời nhắn (Cho Admin xem)
    @GetMapping
    public List<Contact> getAllContacts() {
        return contactRepository.findAll();
    }
}