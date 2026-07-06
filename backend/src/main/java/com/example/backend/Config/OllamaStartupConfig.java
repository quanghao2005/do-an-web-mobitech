package com.example.backend.Config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import java.util.HashMap;
import java.util.Map;

@Component
public class OllamaStartupConfig implements CommandLineRunner {

    @Override
    public void run(String... args) throws Exception {
        // Chạy đa luồng (Thread) để không làm chậm quá trình khởi động của Backend
        new Thread(() -> {
            try {
                System.out.println("=====================================================");
                System.out.println("====== [AI] DANG NAP MODEL QWEN VAO BO NHO... ======");
                System.out.println("=====================================================");
                
                String ollamaUrl = "http://localhost:11434/api/generate";
                
                Map<String, Object> requestBody = new HashMap<>();
                requestBody.put("model", "qwen2.5:1.5b");
                requestBody.put("prompt", "xin chao");
                requestBody.put("stream", false);
                
                // Gửi một tin nhắn nháp để ép Ollama phải load model lên RAM ngay lập tức
                RestTemplate restTemplate = new RestTemplate();
                restTemplate.postForObject(ollamaUrl, requestBody, Map.class);
                
                System.out.println("=====================================================");
                System.out.println("====== [AI] DA NAP XONG MODEL QWEN2.5 TUDONG! ======");
                System.out.println("=====================================================");
            } catch (Exception e) {
                System.err.println("====== [AI LOI] KHONG THE KET NOI OLLAMA! Ban xem lai xem app Ollama duoc mo chua? ======");
            }
        }).start();
    }
}
