USE phone_db;

UPDATE products 
SET 
  description = '[{"type": "text", "content": "Sản phẩm được thiết kế sang trọng, hiệu năng cực kỳ mạnh mẽ mang lại trải nghiệm tuyệt vời."},{"type": "image", "content": "https://images.unsplash.com/photo-1601784551446-20c9e07cd5d9?q=80&w=2070&auto=format&fit=crop"}]',
  color_variants = '[{"colorName": "Đen Nhám", "hex": "#1c1c1c", "imageUrl": ""},{"colorName": "Trắng Sứ", "hex": "#f0f0f0", "imageUrl": ""},{"colorName": "Xanh Titan", "hex": "#4b536b", "imageUrl": ""}]',
  os = 'Tùy chỉnh',
  charging = 'Sạc nhanh',
  security = 'Vân tay'
WHERE id > 0 AND (description LIKE '%S???n ph???m%' OR os LIKE '%T??y ch??nh%' OR color_variants LIKE '%??en Nh??m%');
