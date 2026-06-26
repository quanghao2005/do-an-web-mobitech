package com.example.backend.Entity;

import java.time.LocalDateTime;

import com.fasterxml.jackson.annotation.JsonProperty;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "sender_id")
    private Long senderId;   
    
    @Column(name = "receiver_id")
    private Long receiverId; 
    
    @Column(columnDefinition = "TEXT")
    private String content;
    
    private LocalDateTime timestamp = LocalDateTime.now();
    
    @Column(name = "is_from_admin")
    @JsonProperty("isFromAdmin") // Ép giữ nguyên tên trường này khi trả về JSON cho React
    private boolean isFromAdmin; 

    public ChatMessage() {}

    // Getter/Setter chuẩn (Rất quan trọng)
    public boolean getIsFromAdmin() { return isFromAdmin; }
    public void setIsFromAdmin(boolean fromAdmin) { isFromAdmin = fromAdmin; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }
    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}