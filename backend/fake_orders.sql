-- Tự động sinh dữ liệu ảo (Đơn hàng) cho tháng 5, 6, 7 năm 2026

DELIMITER $$
DROP PROCEDURE IF EXISTS generate_fake_orders$$
CREATE PROCEDURE generate_fake_orders()
BEGIN
    DECLARE i INT DEFAULT 1;
    DECLARE order_date DATETIME;
    DECLARE fake_total DOUBLE;
    
    WHILE i <= 300 DO
        -- Tháng 5, 6, 7 (mỗi tháng 100 đơn)
        IF i <= 100 THEN
            SET order_date = CONCAT('2026-05-', LPAD(FLOOR(1 + (RAND() * 28)), 2, '0'), ' 10:00:00');
        ELSEIF i <= 200 THEN
            SET order_date = CONCAT('2026-06-', LPAD(FLOOR(1 + (RAND() * 28)), 2, '0'), ' 14:00:00');
        ELSE
            SET order_date = CONCAT('2026-07-', LPAD(FLOOR(1 + (RAND() * 28)), 2, '0'), ' 16:30:00');
        END IF;

        -- Mỗi đơn trị giá từ 500,000,000 đến 1,200,000,000 để tổng doanh thu > 200 tỷ (vượt vốn nhập kho)
        SET fake_total = 500000000 + FLOOR(RAND() * 700000000);

        INSERT INTO orders (address, created_at, fullname, payment_method, phone, status, total, user_id, email)
        VALUES ('HCM', order_date, CONCAT('Khách Hàng VIP ', i), 'COD', '0901234567', 'DELIVERED', fake_total, NULL, 'vip@gmail.com');
        
        SET i = i + 1;
    END WHILE;
END$$
DELIMITER ;

CALL generate_fake_orders();
DROP PROCEDURE generate_fake_orders;
