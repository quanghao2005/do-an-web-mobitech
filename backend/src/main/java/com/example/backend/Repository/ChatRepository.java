package com.example.backend.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.Entity.ChatMessage;

@Repository
public interface ChatRepository extends JpaRepository<ChatMessage, Long> {
    
    // Lấy lịch sử chat của 1 khách hàng (gửi đi hoặc nhận từ admin)
    @Query("SELECT c FROM ChatMessage c WHERE c.senderId = ?1 OR c.receiverId = ?1 ORDER BY c.timestamp ASC")
    List<ChatMessage> findChatHistory(Long userId);
}