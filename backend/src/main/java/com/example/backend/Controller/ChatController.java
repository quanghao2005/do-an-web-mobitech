package com.example.backend.Controller;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import com.example.backend.Entity.Product;
import com.example.backend.Repository.ProductRepository;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private com.example.backend.Repository.ChatRepository chatRepository;

    @org.springframework.beans.factory.annotation.Value("${gemini.api.key}")
    private String geminiApiKey;

    // API: Gửi tin nhắn thực tế (Khách <-> Admin)
    @PostMapping("/send")
    public com.example.backend.Entity.ChatMessage sendMessage(@RequestBody com.example.backend.Entity.ChatMessage message) {
        if (message.getTimestamp() == null) {
            message.setTimestamp(java.time.LocalDateTime.now());
        }
        return chatRepository.save(message);
    }

    // API: Lấy lịch sử tin nhắn thực tế
    @GetMapping("/history/{userId}")
    public List<com.example.backend.Entity.ChatMessage> getChatHistory(@org.springframework.web.bind.annotation.PathVariable Long userId) {
        return chatRepository.findChatHistory(userId);
    }

    // API: Lấy tất cả tin nhắn (Dành cho Admin xem danh sách chat)
    @GetMapping("/admin/all")
    public List<com.example.backend.Entity.ChatMessage> getAllChats() {
        return chatRepository.findAll();
    }

    @PostMapping("/ask")
    public Map<String, Object> askAI(@RequestBody Map<String, String> request) {
        String userMessage = request.get("message");
        if (userMessage == null || userMessage.isEmpty()) {
            return Collections.singletonMap("response", "Dạ, MobiTech có thể giúp gì cho bạn không ạ?");
        }

        String queryLower = userMessage.toLowerCase();

        // 1. Lấy danh sách sản phẩm đang bán
        List<Product> allProducts = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == 1)
                .collect(Collectors.toList());

        List<Product> relevantProducts;

        // 2. Logic lọc sản phẩm GIẢM GIÁ thông minh
        if (queryLower.contains("giảm giá") || queryLower.contains("khuyến mãi") || 
            queryLower.contains("sale") || queryLower.contains("rẻ")) {
            
            relevantProducts = allProducts.stream()
                    .filter(p -> p.getOldPrice() != null && p.getOldPrice() > p.getPrice())
                    .limit(8)
                    .collect(Collectors.toList());
        } else {
            // Lọc theo tên máy khách hỏi
            relevantProducts = allProducts.stream()
                    .filter(p -> {
                        String name = p.getName().toLowerCase();
                        return queryLower.contains(name) || name.contains(queryLower) || 
                               queryLower.contains(name.split(" ")[0]);
                    })
                    .limit(10)
                    .collect(Collectors.toList());
        }

        if (relevantProducts.isEmpty()) {
            relevantProducts = allProducts.stream().limit(5).collect(Collectors.toList());
        }

        // 3. Xây dựng Context dữ liệu (có tính % giảm giá để AI tư vấn)
        String context = relevantProducts.stream()
                .map(p -> {
                    String saleNote = "";
                    if (p.getOldPrice() != null && p.getOldPrice() > p.getPrice()) {
                        double percent = ((p.getOldPrice() - p.getPrice()) / p.getOldPrice()) * 100;
                        saleNote = String.format(" [ĐANG SALE %,.0f%%, Giá cũ: %,.0f VNĐ]", percent, p.getOldPrice());
                    }
                    return String.format("- ID: %d | %s | Giá: %,.0f VNĐ%s | Chip: %s | RAM: %s | Pin: %s", 
                        p.getId(), p.getName(), p.getPrice(), saleNote, p.getCpu(), p.getRam(), p.getBattery());
                })
                .collect(Collectors.joining("\n"));

        // 4. Prompt điều hướng AI
        String fullPrompt = 
            "Bạn là chuyên viên tư vấn của MobiTech. Đây là dữ liệu sản phẩm thực tế:\n" + context + "\n\n" +
            "QUY TẮC:\n" +
            "1. Nếu khách hỏi về giảm giá/sale, hãy giới thiệu nhiệt tình các máy có ghi chú [ĐANG SALE].\n" +
            "2. Nhấn mạnh số tiền tiết kiệm được để kích thích khách mua.\n" +
            "3. Nếu khách hỏi máy không có trong danh sách, báo là tạm hết hàng và gợi ý máy khác tương đương.\n" +
            "4. Trả lời lễ phép, ngắn gọn bằng tiếng Việt.\n" +
            "5. ĐỊNH DẠNG: Sử dụng thẻ <b>chữ in đậm</b> thay vì dấu **.\n" +
            "6. BẮT BUỘC: Khi giới thiệu 1 sản phẩm cụ thể, HÃY hiển thị hình ảnh của nó bằng cú pháp: [PRODUCT_IMAGE:ID] (Ví dụ: [PRODUCT_IMAGE:1])\n\n" +
            "Câu hỏi: " + userMessage;

        // 5. Gọi Google Gemini API
         String geminiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=" + geminiApiKey;

        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", fullPrompt);
        
        Map<String, Object> parts = new HashMap<>();
        parts.put("parts", Collections.singletonList(textPart));
        
        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(parts));

        RestTemplate restTemplate = new RestTemplate();
        try {
            Map response = restTemplate.postForObject(geminiUrl, requestBody, Map.class);
            
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates != null && !candidates.isEmpty()) {
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> resParts = (List<Map<String, Object>>) content.get("parts");
                if (resParts != null && !resParts.isEmpty()) {
                    String text = (String) resParts.get(0).get("text");
                    
                    // Replace [PRODUCT_IMAGE:ID] with HTML
                    java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("\\[PRODUCT_IMAGE:(\\d+)\\]");
                    java.util.regex.Matcher matcher = pattern.matcher(text);
                    StringBuffer sb = new StringBuffer();
                    while (matcher.find()) {
                        Long pId = Long.parseLong(matcher.group(1));
                        Product p = productRepository.findById(pId).orElse(null);
                        if (p != null) {
                            String imgHtml = "<br/><a href=\"/product/" + pId + "\"><img src=\"" + p.getImageUrl() + "\" style=\"width: 200px; border-radius: 10px; margin-top: 5px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\" alt=\"" + p.getName() + "\"/></a><br/>";
                            matcher.appendReplacement(sb, java.util.regex.Matcher.quoteReplacement(imgHtml));
                        } else {
                            matcher.appendReplacement(sb, "");
                        }
                    }
                    matcher.appendTail(sb);
                    text = sb.toString();
                    
                    return Collections.singletonMap("response", text);
                }
            }
            return Collections.singletonMap("response", "Dạ, hiện tại hệ thống đang xử lý, bạn vui lòng đợi xíu nhé!");
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.singletonMap("response", "Dạ, hệ thống AI của MobiTech đang bảo trì cập nhật bảng giá, bạn đợi xíu nhé!");
        }
    }
}