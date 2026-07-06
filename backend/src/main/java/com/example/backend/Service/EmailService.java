package com.example.backend.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.example.backend.Entity.Order;
import com.example.backend.Entity.OrderDetail;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public void sendOrderConfirmationEmail(String toEmail, String customerName, Order order) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Xác nhận đơn hàng #" + order.getId() + " - Cửa hàng điện thoại");

            String htmlContent = buildHtmlContent(customerName, order);
            helper.setText(htmlContent, true); 

            javaMailSender.send(message);
            System.out.println("Đã gửi email xác nhận thành công đến: " + toEmail);

        } catch (MessagingException e) {
            System.err.println("Lỗi khi gửi email: " + e.getMessage());
        }
    }

    public void sendOTPEmail(String toEmail, String otp) {
        try {
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Mã OTP Đăng Nhập / Quên Mật Khẩu");

            String htmlContent = "<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>"
                    + "<h2 style='color: #0056b3;'>Yêu cầu cấp lại mật khẩu</h2>"
                    + "<p>Xin chào,</p>"
                    + "<p>Bạn vừa yêu cầu đăng nhập bằng mã OTP. Dưới đây là mã xác nhận của bạn:</p>"
                    + "<h1 style='color: #d9534f; background: #f9f9f9; padding: 10px; text-align: center; border-radius: 5px; font-size: 32px; letter-spacing: 5px;'>" + otp + "</h1>"
                    + "<p>Mã này có hiệu lực trong vòng <strong>5 phút</strong>.</p>"
                    + "<p>Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>"
                    + "</div>";

            helper.setText(htmlContent, true); 
            javaMailSender.send(message);
        } catch (MessagingException e) {
            System.err.println("Lỗi khi gửi email OTP: " + e.getMessage());
        }
    }

    private String buildHtmlContent(String customerName, Order order) {
        StringBuilder html = new StringBuilder();
        
        html.append("<div style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>");
        html.append("<h2 style='color: #0056b3;'>Cảm ơn bạn đã đặt hàng!</h2>");
        html.append("<p>Xin chào <b>").append(customerName).append("</b>,</p>");
        html.append("<p>Đơn hàng của bạn đã được ghi nhận trên hệ thống. Dưới đây là thông tin chi tiết:</p>");
        
        html.append("<h3>Mã đơn hàng: #").append(order.getId()).append("</h3>");

        html.append("<table style='width: 100%; border-collapse: collapse; margin-top: 10px;'>");
        html.append("<tr style='background-color: #f8f9fa; text-align: left;'>");
        html.append("<th style='border: 1px solid #ddd; padding: 8px;'>Sản phẩm</th>");
        html.append("<th style='border: 1px solid #ddd; padding: 8px;'>Số lượng</th>");
        html.append("<th style='border: 1px solid #ddd; padding: 8px;'>Đơn giá</th>");
        html.append("<th style='border: 1px solid #ddd; padding: 8px;'>Thành tiền</th>");
        html.append("</tr>");

        // Lấy danh sách sản phẩm từ getDetails() thay vì getOrderDetails()
        for (OrderDetail detail : order.getDetails()) {
            String productName = detail.getProduct().getName();
            int quantity = detail.getQuantity();
            
            // Đã fix lỗi 2: Chuyển sang dùng Double
            Double price = detail.getPrice(); 
            Double subtotal = price * quantity;

            html.append("<tr>");
            html.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(productName).append("</td>");
            html.append("<td style='border: 1px solid #ddd; padding: 8px; text-align: center;'>").append(quantity).append("</td>");
            html.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(String.format("%,.0f", price)).append(" VNĐ</td>");
            html.append("<td style='border: 1px solid #ddd; padding: 8px;'>").append(String.format("%,.0f", subtotal)).append(" VNĐ</td>");
            html.append("</tr>");
        }

        html.append("</table>");

        html.append("<h3 style='text-align: right; color: #d9534f; margin-top: 20px;'>");
        
        // Lấy tổng tiền từ getTotal() thay vì getTotalAmount()
        html.append("Tổng thanh toán: ").append(String.format("%,.0f", order.getTotal())).append(" VNĐ");
        
        html.append("</h3>");

        html.append("<p>Chúng tôi sẽ sớm liên hệ để giao hàng cho bạn. Chúc bạn một ngày tốt lành!</p>");
        html.append("<br><hr>");
        html.append("<p style='font-size: 12px; color: #888;'>Đây là email tự động, vui lòng không trả lời.</p>");
        html.append("</div>");

        return html.toString();
    }
}