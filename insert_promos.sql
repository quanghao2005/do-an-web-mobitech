USE phone_db;

INSERT INTO promotions (code, name, discount_type, discount_value, min_order_value, start_date, end_date, usage_limit, used_count, status, is_public) VALUES 
('SALEGIUATHANG', 'Sale Lớn Giữa Tháng', 'FIXED', 200000, 5000000, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), 1000, 0, 1, 0),
('BACK2SCHOOL', 'Tựu Trường Sành Điệu', 'FIXED', 500000, 10000000, NOW(), DATE_ADD(NOW(), INTERVAL 60 DAY), 500, 0, 1, 0),
('BLACKFRIDAY500K', 'Black Friday Sập Sàn', 'FIXED', 500000, 20000000, NOW(), DATE_ADD(NOW(), INTERVAL 5 DAY), 100, 0, 1, 0),
('FLASHSALE99K', 'Flash Sale Chớp Nhoáng', 'FIXED', 99000, 1000000, NOW(), DATE_ADD(NOW(), INTERVAL 1 DAY), 2000, 0, 1, 0);
