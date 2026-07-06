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
        String history = request.getOrDefault("history", "Không có lịch sử");
        
        if (userMessage == null || userMessage.isEmpty()) {
            return Collections.singletonMap("response", "Dạ, MobiTech có thể giúp gì cho bạn không ạ?");
        }

        String queryLower = userMessage.toLowerCase();

        // 1. Lấy danh sách sản phẩm đang bán
        List<Product> allProducts = productRepository.findAll().stream()
                .filter(p -> p.getStatus() == 1)
                .collect(Collectors.toList());

        List<Product> relevantProducts = allProducts;

        // --- BỘ LỌC NGỮ CẢNH TẬP TRUNG (Ngăn chặn AI "nhìn lén" sản phẩm ngoài lề) ---
        boolean isFollowUp = queryLower.matches(".*(trong đó|số đó|những máy đó|các máy đó|sản phẩm đó|những máy này|các máy này).*");
                             
        String historyContext = "";
        if (isFollowUp && !history.equals("Không có lịch sử")) {
            // Nếu là câu hỏi nối tiếp, CHỈ nạp dữ liệu của những máy đã từng được nhắc tên trong Lịch sử
            relevantProducts = relevantProducts.stream()
                .filter(p -> history.contains(p.getName()) || 
                             (p.getName().length() > 5 && history.contains(p.getName().substring(0, 5))))
                .collect(Collectors.toList());
            historyContext = "LỊCH SỬ CHAT VỚI KHÁCH GẦN ĐÂY:\n" + history + "\n\n";
        } else {
            // KHÔNG phải câu hỏi nối tiếp -> Ẩn lịch sử chat để AI không bị "ảo giác" lấy râu ông nọ cắm cằm bà kia
            // --- BỘ LỌC GIÁ TIỀN, TỪ KHÓA & SẮP XẾP BẰNG JAVA ---
            boolean filtered = false;
            try {
                java.util.regex.Pattern pDuoi = java.util.regex.Pattern.compile("dưới (\\d+)\\s*(tr|triệu)", java.util.regex.Pattern.CASE_INSENSITIVE);
                java.util.regex.Matcher mDuoi = pDuoi.matcher(queryLower);
                if (mDuoi.find()) {
                    long maxPrice = Long.parseLong(mDuoi.group(1)) * 1000000;
                    relevantProducts = relevantProducts.stream()
                        .filter(p -> p.getPrice() != null && p.getPrice() < maxPrice)
                        .collect(Collectors.toList());
                    filtered = true;
                }

                if (!filtered) {
                    java.util.regex.Pattern pTuDen = java.util.regex.Pattern.compile("từ (\\d+)\\s*(đến|-)\\s*(\\d+)\\s*(tr|triệu)", java.util.regex.Pattern.CASE_INSENSITIVE);
                    java.util.regex.Matcher mTuDen = pTuDen.matcher(queryLower);
                    if (mTuDen.find()) {
                        long minPrice = Long.parseLong(mTuDen.group(1)) * 1000000;
                        long maxPrice = Long.parseLong(mTuDen.group(3)) * 1000000;
                        relevantProducts = relevantProducts.stream()
                            .filter(p -> p.getPrice() != null && p.getPrice() >= minPrice && p.getPrice() <= maxPrice)
                            .collect(Collectors.toList());
                        filtered = true;
                    }
                }

                if (!filtered) {
                    java.util.regex.Pattern pKhoang = java.util.regex.Pattern.compile("khoảng (\\d+)\\s*(tr|triệu|t)", java.util.regex.Pattern.CASE_INSENSITIVE);
                    java.util.regex.Matcher mKhoang = pKhoang.matcher(queryLower);
                    if (mKhoang.find()) {
                        long targetPrice = Long.parseLong(mKhoang.group(1)) * 1000000;
                        long minPrice = targetPrice - 4000000; // +- 4 triệu
                        long maxPrice = targetPrice + 4000000;
                        relevantProducts = relevantProducts.stream()
                            .filter(p -> p.getPrice() != null && p.getPrice() >= minPrice && p.getPrice() <= maxPrice)
                            .sorted((p1, p2) -> Double.compare(Math.abs(p1.getPrice() - targetPrice), Math.abs(p2.getPrice() - targetPrice)))
                            .collect(Collectors.toList());
                        filtered = true;
                    }
                }

                if (!filtered) {
                    java.util.regex.Pattern pTren = java.util.regex.Pattern.compile("trên (\\d+)\\s*(tr|triệu)", java.util.regex.Pattern.CASE_INSENSITIVE);
                    java.util.regex.Matcher mTren = pTren.matcher(queryLower);
                    if (mTren.find()) {
                        long minPrice = Long.parseLong(mTren.group(1)) * 1000000;
                        relevantProducts = relevantProducts.stream()
                            .filter(p -> p.getPrice() != null && p.getPrice() > minPrice)
                            .collect(Collectors.toList());
                        filtered = true;
                    }
                }

                // Xử lý câu hỏi "Đắt nhất", "Mạnh nhất", "Rẻ nhất"
                if (queryLower.contains("đắt") || queryLower.contains("cao") || queryLower.contains("mạnh") || queryLower.contains("xịn") || queryLower.contains("tốt nhất")) {
                    int limit = 5;
                    java.util.regex.Matcher mLimit = java.util.regex.Pattern.compile("(\\d+)").matcher(queryLower);
                    if (mLimit.find()) limit = Integer.parseInt(mLimit.group(1));
                    
                    relevantProducts = relevantProducts.stream()
                        .filter(p -> p.getPrice() != null)
                        .sorted((p1, p2) -> Double.compare(p2.getPrice(), p1.getPrice()))
                        .limit(limit)
                        .collect(Collectors.toList());
                    filtered = true;
                } else if (queryLower.contains("rẻ") || queryLower.contains("thấp nhất")) {
                    int limit = 5;
                    java.util.regex.Matcher mLimit = java.util.regex.Pattern.compile("(\\d+)").matcher(queryLower);
                    if (mLimit.find()) limit = Integer.parseInt(mLimit.group(1));
                    
                    relevantProducts = relevantProducts.stream()
                        .filter(p -> p.getPrice() != null && p.getPrice() > 0)
                        .sorted((p1, p2) -> Double.compare(p1.getPrice(), p2.getPrice()))
                        .limit(limit)
                        .collect(Collectors.toList());
                    filtered = true;
                }

                // Nếu khách không hỏi giá, kiểm tra xem khách có gọi tên Hãng/Dòng máy không
                if (!filtered) {
                    List<Product> brandFiltered = relevantProducts.stream()
                        .filter(p -> {
                            String name = p.getName().toLowerCase();
                            return (queryLower.contains("iphone") && name.contains("iphone")) ||
                                   (queryLower.contains("samsung") && name.contains("samsung")) ||
                                   (queryLower.contains("oppo") && name.contains("oppo")) ||
                                   (queryLower.contains("xiaomi") && name.contains("xiaomi")) ||
                                   (queryLower.contains("redmi") && name.contains("redmi")) ||
                                   (queryLower.contains("nokia") && name.contains("nokia")) ||
                                   (queryLower.contains("vivo") && name.contains("vivo")) ||
                                   (queryLower.contains("realme") && name.contains("realme"));
                        })
                        .collect(Collectors.toList());
                    if (!brandFiltered.isEmpty()) {
                        relevantProducts = brandFiltered;
                    }
                }
            } catch (Exception ignored) {}
            
            // GIỚI HẠN SỐ LƯỢNG SẢN PHẨM ĐỂ TRÁNH QUÁ TẢI CONTEXT CỦA QWEN 1.5B
            if (relevantProducts.size() > 8) {
                relevantProducts = relevantProducts.subList(0, 8);
            }
        }
        // --------------------------------------------------------------------------------------

        // 3. Xây dựng Context dữ liệu (Đổi sang định dạng DỌC để AI nhỏ không bị lú/hallucinate)
        String context = "THÔNG BÁO: HỆ THỐNG HIỆN ĐANG TÌM THẤY CHÍNH XÁC " + relevantProducts.size() + " SẢN PHẨM KHỚP YÊU CẦU.\n\n" +
                relevantProducts.stream()
                .map(p -> {
                    String saleNote = "";
                    if (p.getOldPrice() != null && p.getOldPrice() > p.getPrice()) {
                        double percent = ((p.getOldPrice() - p.getPrice()) / p.getOldPrice()) * 100;
                        saleNote = String.format("\n- Khuyến mãi: ĐANG SALE %,.0f%% (Giá gốc: %,.0f VNĐ)", percent, p.getOldPrice());
                    }
                    return String.format("SẢN PHẨM:\n- Tên máy: %s [PRODUCT_IMAGE:%d]\n- Giá bán: %,.0f VNĐ%s\n- Cấu hình: Chip %s, RAM %s, Pin %s\n", 
                        p.getName(), p.getId(), p.getPrice(), saleNote, p.getCpu(), p.getRam(), p.getBattery());
                })
                .collect(Collectors.joining("\n-------------------\n"));

        // 4. Prompt điều hướng AI (Mềm dẻo, nhiệt tình và có LỊCH SỬ CHAT)
        String fullPrompt = 
            "Bạn là trợ lý AI bán hàng siêu thông minh, nhiệt tình và khéo léo của MobiTech.\n\n" +
            "THÔNG TIN CHUNG VỀ MOBITECH ĐỂ BẠN TƯ VẤN:\n" +
            "- Mua hàng: Khách có thể click vào ảnh máy để xem chi tiết, thêm vào giỏ hàng và thanh toán trực tuyến.\n" +
            "- Khuyến mãi: Luôn có mã giảm giá (voucher) hiển thị ở trang Thanh toán.\n" +
            "- Bảo hành: Cam kết hàng chính hãng, bảo hành 12 tháng, lỗi 1 đổi 1 trong 30 ngày.\n\n" +
            historyContext +
            "DỮ LIỆU SẢN PHẨM ĐANG CÓ (LƯU Ý: CHỈ ĐƯỢC PHÉP CHỌN SẢN PHẨM TỪ DANH SÁCH NÀY):\n" + context + "\n\n" +
            "QUY TẮC SỐNG CÒN:\n" +
            "1. CHUẨN XÁC DỮ LIỆU: KHI TRẢ LỜI, BẠN BẮT BUỘC CHỈ ĐƯỢC CHỌN SẢN PHẨM CÓ TRONG MỤC 'DỮ LIỆU SẢN PHẨM ĐANG CÓ' Ở TRÊN. TUYỆT ĐỐI KHÔNG lấy các sản phẩm đắt tiền trong 'LỊCH SỬ CHAT' để trả lời cho câu hỏi mới.\n" +
            "2. GIAO TIẾP TỰ NHIÊN: Nếu khách hỏi 'shop có bao nhiêu sản phẩm', hãy trả lời chính xác con số được cung cấp ở phần THÔNG BÁO. Không được tự ý thêm số 0.\n" +
            "3. BẮT BUỘC HÌNH ẢNH: Khi giới thiệu máy, PHẢI copy nguyên xi đoạn [PRODUCT_IMAGE:...] dán sát ngay cạnh tên máy.\n" +
            "4. KHÔNG BỊA ĐẶT GIÁ: Copy đúng 100% Giá bán và Khuyến mãi. Nếu danh sách dữ liệu trống, hãy xin lỗi khách.\n" +
            "5. Không dùng dấu sao **, hãy dùng chữ bình thường, mỗi máy xuống dòng rõ ràng.\n\n" +
            "Câu hỏi hiện tại của khách: " + userMessage;

        // 5. Gọi Ollama API (Local Qwen2.5)
        String ollamaUrl = "http://localhost:11434/api/generate";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "qwen2.5:1.5b");
        requestBody.put("prompt", fullPrompt);
        requestBody.put("stream", false);

        RestTemplate restTemplate = new RestTemplate();
        try {
            Map response = restTemplate.postForObject(ollamaUrl, requestBody, Map.class);
            
            if (response != null && response.containsKey("response")) {
                String text = (String) response.get("response");
                
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
                
                // FALLBACK: Nếu AI "quên" in ra tag [PRODUCT_IMAGE] nhưng có nhắc tên máy, ta tự động chèn ảnh vào cuối câu trả lời
                for (Product p : relevantProducts) {
                    if (!text.contains(p.getImageUrl()) && text.toLowerCase().contains(p.getName().toLowerCase())) {
                        String imgHtml = "<br/><a href=\"/product/" + p.getId() + "\"><img src=\"" + p.getImageUrl() + "\" style=\"width: 200px; border-radius: 10px; margin-top: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);\" alt=\"" + p.getName() + "\"/></a><br/>";
                        text += imgHtml;
                    }
                }

                // Xử lý xuống dòng để hiển thị HTML đẹp
                text = text.replace("\n", "<br/>").replace("**", "");
                
                return Collections.singletonMap("response", text);
            }
            return Collections.singletonMap("response", "Dạ, hiện tại hệ thống đang xử lý, bạn vui lòng đợi xíu nhé!");
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.singletonMap("response", "Dạ, hệ thống AI của MobiTech đang bảo trì hoặc chưa bật Ollama, bạn đợi xíu nhé!");
        }
    }
}