const fs = require('fs');
const { execSync } = require('child_process');

const products = [
    {
        name: "iPhone 15 Pro Max", price: 34990000, old_price: 36990000, desc: "Titanium siêu nhẹ. Cảm biến chính 48MP siêu nét. Chip A17 Pro.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Titan Tự Nhiên", hex: "#b5b6b1", imageUrl: ""}, {colorName: "Titan Xanh", hex: "#3b434c", imageUrl: ""}, {colorName: "Titan Đen", hex: "#424146", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}, {label: "8GB/512GB", extra: 5000000}, {label: "8GB/1TB", extra: 10000000}],
        os: "iOS 17", cpu: "Apple A17 Pro 6 nhân", gpu: "Apple GPU 6 nhân", ram: "8GB", storage: "256GB", screen: "6.7 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "4422mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 15 Pro", price: 28990000, old_price: 30990000, desc: "Sức mạnh A17 Pro trong thân máy nhỏ gọn. Thiết kế viền Titan bền bỉ.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Titan Đen", hex: "#424146", imageUrl: ""}, {colorName: "Titan Trắng", hex: "#f2f1ed", imageUrl: ""}],
        rams: [{label: "8GB/128GB", extra: 0}, {label: "8GB/256GB", extra: 3000000}],
        os: "iOS 17", cpu: "Apple A17 Pro 6 nhân", gpu: "Apple GPU 6 nhân", ram: "8GB", storage: "128GB", screen: "6.1 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "3274mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 14 Pro Max", price: 26990000, old_price: 29990000, desc: "Dynamic Island đột phá, camera 48MP bắt trọn khoảnh khắc.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Tím Đậm", hex: "#594f63", imageUrl: ""}, {colorName: "Vàng", hex: "#f4e8ce", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}, {label: "6GB/256GB", extra: 2500000}],
        os: "iOS 16", cpu: "Apple A16 Bionic", gpu: "Apple GPU 5 nhân", ram: "6GB", storage: "128GB", screen: "6.7 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "4323mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 13", price: 15990000, old_price: 17990000, desc: "Sự lựa chọn quốc dân. Pin trâu, hiệu năng ổn định mượt mà.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Hồng", hex: "#fae1dc", imageUrl: ""}, {colorName: "Trắng", hex: "#fbf7f4", imageUrl: ""}],
        rams: [{label: "4GB/128GB", extra: 0}],
        os: "iOS 15", cpu: "Apple A15 Bionic", gpu: "Apple GPU 4 nhân", ram: "4GB", storage: "128GB", screen: "6.1 inch", screen_tech: "Super Retina XDR OLED", camera: "12MP + 12MP", selfie: "12MP", battery: "3240mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 11", price: 9990000, old_price: 11990000, desc: "Huyền thoại chưa bao giờ hết hot. Trải nghiệm iOS trọn vẹn giá rẻ.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen", hex: "#1f2020", imageUrl: ""}, {colorName: "Xanh Mint", hex: "#aee1cd", imageUrl: ""}],
        rams: [{label: "4GB/64GB", extra: 0}],
        os: "iOS 13", cpu: "Apple A13 Bionic", gpu: "Apple GPU 4 nhân", ram: "4GB", storage: "64GB", screen: "6.1 inch", screen_tech: "Liquid Retina IPS LCD", camera: "12MP + 12MP", selfie: "12MP", battery: "3110mAh", charging: "Sạc nhanh 18W", security: "Face ID"
    },

    // SAMSUNG (Category 2)
    {
        name: "Samsung Galaxy S24 Ultra", price: 33990000, old_price: 36990000, desc: "Quyền năng AI đỉnh cao, bút S-Pen quyền lực, viền Titanium.",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop",
        colors: [{colorName: "Xám Titan", hex: "#7a7977", imageUrl: ""}, {colorName: "Đen Titan", hex: "#3e3d3b", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}, {label: "12GB/512GB", extra: 3500000}],
        os: "Android 14", cpu: "Snapdragon 8 Gen 3 for Galaxy", gpu: "Adreno 750", ram: "12GB", storage: "256GB", screen: "6.8 inch", screen_tech: "Dynamic AMOLED 2X", camera: "200MP + 50MP + 12MP + 10MP", selfie: "12MP", battery: "5000mAh", charging: "Sạc nhanh 45W", security: "Vân tay siêu âm"
    },
    {
        name: "Samsung Galaxy S24+", price: 23990000, old_price: 25990000, desc: "Màn hình cực đại sắc nét, thiết kế nguyên khối sang trọng.",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop",
        colors: [{colorName: "Tím Cobalt", hex: "#5b516b", imageUrl: ""}, {colorName: "Vàng Amber", hex: "#e2d2ae", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}],
        os: "Android 14", cpu: "Exynos 2400", gpu: "Xclipse 940", ram: "12GB", storage: "256GB", screen: "6.7 inch", screen_tech: "Dynamic AMOLED 2X", camera: "50MP + 12MP + 10MP", selfie: "12MP", battery: "4900mAh", charging: "Sạc nhanh 45W", security: "Vân tay siêu âm"
    },
    {
        name: "Samsung Galaxy Z Fold5", price: 35990000, old_price: 39990000, desc: "Siêu phẩm gập mở đa nhiệm. Hiệu suất như một chiếc PC bỏ túi.",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop",
        colors: [{colorName: "Xanh Icy", hex: "#b4c3cd", imageUrl: ""}, {colorName: "Đen Phantom", hex: "#2b2b2b", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}, {label: "12GB/512GB", extra: 4000000}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2 for Galaxy", gpu: "Adreno 740", ram: "12GB", storage: "256GB", screen: "7.6 inch (Chính) / 6.2 inch (Phụ)", screen_tech: "Dynamic AMOLED 2X", camera: "50MP + 12MP + 10MP", selfie: "4MP (Dưới màn) + 10MP", battery: "4400mAh", charging: "Sạc nhanh 25W", security: "Vân tay cạnh viền"
    },
    {
        name: "Samsung Galaxy Z Flip5", price: 19990000, old_price: 22990000, desc: "Gập gọn phong cách, màn hình phụ Flex Window cực lớn.",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop",
        colors: [{colorName: "Xanh Mint", hex: "#d8ebd9", imageUrl: ""}, {colorName: "Tím", hex: "#c9bcdf", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2 for Galaxy", gpu: "Adreno 740", ram: "8GB", storage: "256GB", screen: "6.7 inch (Chính) / 3.4 inch (Phụ)", screen_tech: "Dynamic AMOLED 2X", camera: "12MP + 12MP", selfie: "10MP", battery: "3700mAh", charging: "Sạc nhanh 25W", security: "Vân tay cạnh viền"
    },
    {
        name: "Samsung Galaxy A55 5G", price: 9990000, old_price: 10990000, desc: "Thiết kế cao cấp, camera Nightography chụp đêm ấn tượng.",
        image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?q=80&w=2071&auto=format&fit=crop",
        colors: [{colorName: "Xanh Iceblue", hex: "#b9cfe1", imageUrl: ""}, {colorName: "Đen", hex: "#232528", imageUrl: ""}],
        rams: [{label: "8GB/128GB", extra: 0}],
        os: "Android 14", cpu: "Exynos 1480", gpu: "Xclipse 530", ram: "8GB", storage: "128GB", screen: "6.6 inch", screen_tech: "Super AMOLED 120Hz", camera: "50MP + 12MP + 5MP", selfie: "32MP", battery: "5000mAh", charging: "Sạc nhanh 25W", security: "Vân tay dưới màn hình"
    },

    // OPPO (Category 3)
    {
        name: "OPPO Find N3 Fold", price: 44990000, old_price: 46990000, desc: "Siêu mỏng nhẹ, camera Hasselblad đỉnh cao, màn hình rực rỡ.",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?q=80&w=1953&auto=format&fit=crop",
        colors: [{colorName: "Vàng Sang Trọng", hex: "#e5d3b3", imageUrl: ""}],
        rams: [{label: "16GB/512GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2", gpu: "Adreno 740", ram: "16GB", storage: "512GB", screen: "7.82 inch (Chính) / 6.31 inch (Phụ)", screen_tech: "LTPO3 OLED", camera: "48MP + 64MP + 48MP", selfie: "20MP + 32MP", battery: "4805mAh", charging: "Sạc nhanh 67W", security: "Vân tay cạnh viền"
    },
    {
        name: "OPPO Reno11 Pro 5G", price: 16990000, old_price: 18990000, desc: "Chuyên gia chân dung. Thiết kế vân đá mặt lưng cực độc đáo.",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?q=80&w=1953&auto=format&fit=crop",
        colors: [{colorName: "Trắng Ngọc Trai", hex: "#f0f2f5", imageUrl: ""}, {colorName: "Xám Xanh", hex: "#5a6e73", imageUrl: ""}],
        rams: [{label: "12GB/512GB", extra: 0}],
        os: "Android 14", cpu: "MediaTek Dimensity 8200", gpu: "Mali-G610 MC6", ram: "12GB", storage: "512GB", screen: "6.7 inch", screen_tech: "AMOLED 120Hz", camera: "50MP + 32MP + 8MP", selfie: "32MP", battery: "4600mAh", charging: "Sạc nhanh 80W", security: "Vân tay dưới màn hình"
    },
    {
        name: "OPPO Reno11 5G", price: 10990000, old_price: 11990000, desc: "Trải nghiệm mượt mà, camera siêu nét trong tầm giá.",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?q=80&w=1953&auto=format&fit=crop",
        colors: [{colorName: "Xanh Lượn Sóng", hex: "#57a8a1", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 14", cpu: "MediaTek Dimensity 7050", gpu: "Mali-G68 MC4", ram: "8GB", storage: "256GB", screen: "6.7 inch", screen_tech: "AMOLED 120Hz", camera: "50MP + 32MP + 8MP", selfie: "32MP", battery: "5000mAh", charging: "Sạc nhanh 67W", security: "Vân tay dưới màn hình"
    },
    {
        name: "OPPO A79 5G", price: 7490000, old_price: 7990000, desc: "Pin khủng 5000mAh, sạc nhanh SuperVOOC, thiết kế trẻ trung.",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?q=80&w=1953&auto=format&fit=crop",
        colors: [{colorName: "Tím Huyền Ảo", hex: "#9a7cbb", imageUrl: ""}, {colorName: "Đen", hex: "#222222", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "MediaTek Dimensity 6020", gpu: "Mali-G57 MC2", ram: "8GB", storage: "256GB", screen: "6.72 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "Sạc nhanh 33W", security: "Vân tay cạnh viền"
    },
    {
        name: "OPPO A38", price: 4290000, old_price: 4690000, desc: "Giá rẻ, sạc cực nhanh 33W, camera 50MP AI chụp ảnh rực rỡ.",
        image: "https://images.unsplash.com/photo-1601784551446-20c9e07cd8d6?q=80&w=1953&auto=format&fit=crop",
        colors: [{colorName: "Vàng", hex: "#ecd28d", imageUrl: ""}, {colorName: "Đen", hex: "#1f1f1f", imageUrl: ""}],
        rams: [{label: "4GB/128GB", extra: 0}],
        os: "Android 13", cpu: "MediaTek Helio G85", gpu: "Mali-G52 MC2", ram: "4GB", storage: "128GB", screen: "6.56 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP", selfie: "5MP", battery: "5000mAh", charging: "Sạc nhanh 33W", security: "Vân tay cạnh viền"
    },

    // REDMI (Category 4)
    {
        name: "Xiaomi 14 Ultra", price: 32990000, old_price: 35990000, desc: "Ống kính Leica quang học thế hệ mới, nhiếp ảnh chuyên nghiệp.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen", hex: "#1c1c1c", imageUrl: ""}, {colorName: "Trắng", hex: "#f0f0f0", imageUrl: ""}],
        rams: [{label: "16GB/512GB", extra: 0}],
        os: "Android 14", cpu: "Snapdragon 8 Gen 3", gpu: "Adreno 750", ram: "16GB", storage: "512GB", screen: "6.73 inch", screen_tech: "LTPO AMOLED 120Hz", camera: "50MP + 50MP + 50MP + 50MP", selfie: "32MP", battery: "5000mAh", charging: "Sạc nhanh 90W", security: "Vân tay quang học"
    },
    {
        name: "Xiaomi 14", price: 22990000, old_price: 24990000, desc: "Thiết kế nhỏ gọn, sức mạnh khổng lồ với Snapdragon 8 Gen 3.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Ngọc", hex: "#3b8e83", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}],
        os: "Android 14", cpu: "Snapdragon 8 Gen 3", gpu: "Adreno 750", ram: "12GB", storage: "256GB", screen: "6.36 inch", screen_tech: "LTPO OLED 120Hz", camera: "50MP + 50MP + 50MP", selfie: "32MP", battery: "4610mAh", charging: "Sạc nhanh 90W", security: "Vân tay quang học"
    },
    {
        name: "Redmi Note 13 Pro+ 5G", price: 10990000, old_price: 11990000, desc: "Camera 200MP siêu nét, sạc HyperCharge 120W cực đỉnh.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen Bán Dạ", hex: "#2a2d34", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Dimensity 7200-Ultra", gpu: "Mali-G610 MC4", ram: "8GB", storage: "256GB", screen: "6.67 inch", screen_tech: "AMOLED 1.5K 120Hz", camera: "200MP + 8MP + 2MP", selfie: "16MP", battery: "5000mAh", charging: "Sạc nhanh 120W", security: "Vân tay dưới màn hình"
    },
    {
        name: "Redmi Note 13 Pro 5G", price: 9490000, old_price: 10490000, desc: "Màn hình AMOLED viền siêu mỏng, chip Snapdragon mạnh mẽ.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Lục", hex: "#4b8d7a", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 7s Gen 2", gpu: "Adreno 710", ram: "8GB", storage: "256GB", screen: "6.67 inch", screen_tech: "AMOLED 1.5K 120Hz", camera: "200MP + 8MP + 2MP", selfie: "16MP", battery: "5100mAh", charging: "Sạc nhanh 67W", security: "Vân tay dưới màn hình"
    },
    {
        name: "Redmi 13C", price: 3490000, old_price: 3990000, desc: "Lựa chọn quốc dân giá rẻ, màn hình mượt 90Hz.",
        image: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen", hex: "#222222", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}],
        os: "Android 13", cpu: "MediaTek Helio G85", gpu: "Mali-G52 MC2", ram: "6GB", storage: "128GB", screen: "6.74 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "Sạc nhanh 18W", security: "Vân tay cạnh viền"
    },

    // NOKIA (Category 5)
    {
        name: "Nokia G42 5G", price: 5990000, old_price: 6490000, desc: "Kết nối 5G siêu tốc, vỏ làm từ vật liệu tái chế bền bỉ.",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Tím Thạch Anh", hex: "#8f70b4", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 480+ 5G", gpu: "Adreno 619", ram: "6GB", storage: "128GB", screen: "6.56 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "Sạc nhanh 20W", security: "Vân tay cạnh viền"
    },
    {
        name: "Nokia G22", price: 3990000, old_price: 4490000, desc: "Thiết kế QuickFix dễ dàng tự sửa chữa, pin dùng 3 ngày.",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xám Thiên Thạch", hex: "#4b4b4b", imageUrl: ""}],
        rams: [{label: "4GB/128GB", extra: 0}],
        os: "Android 12", cpu: "Unisoc T606", gpu: "Mali-G57 MP1", ram: "4GB", storage: "128GB", screen: "6.5 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP + 2MP", selfie: "8MP", battery: "5050mAh", charging: "Sạc nhanh 20W", security: "Vân tay cạnh viền"
    },
    {
        name: "Nokia C32", price: 3190000, old_price: 3590000, desc: "Mặt lưng kính cường lực sang trọng trong tầm giá rẻ.",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Hồng Nhạt", hex: "#f0c8c9", imageUrl: ""}],
        rams: [{label: "4GB/64GB", extra: 0}],
        os: "Android 13", cpu: "Unisoc SC9863A", gpu: "IMG8322", ram: "4GB", storage: "64GB", screen: "6.5 inch", screen_tech: "IPS LCD", camera: "50MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "Sạc 10W", security: "Vân tay cạnh viền"
    },
    {
        name: "Nokia C22", price: 2490000, old_price: 2890000, desc: "Siêu bền bỉ với tiêu chuẩn IP52, thời lượng pin 3 ngày.",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen Nhám", hex: "#1c1c1c", imageUrl: ""}],
        rams: [{label: "3GB/64GB", extra: 0}],
        os: "Android 13 (Go)", cpu: "Unisoc SC9863A", gpu: "IMG8322", ram: "3GB", storage: "64GB", screen: "6.5 inch", screen_tech: "IPS LCD", camera: "13MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "Sạc 10W", security: "Vân tay mặt lưng"
    },
    {
        name: "Nokia 105 4G Pro", price: 850000, old_price: 990000, desc: "Điện thoại phổ thông có mạng 4G, pin đàm thoại cực lâu.",
        image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Ngọc", hex: "#347c87", imageUrl: ""}],
        rams: [{label: "128MB", extra: 0}],
        os: "S30+", cpu: "Unisoc T107", gpu: "Không có", ram: "48MB", storage: "128MB", screen: "1.8 inch", screen_tech: "QQVGA", camera: "Không có", selfie: "Không có", battery: "1450mAh", charging: "Sạc MicroUSB", security: "Mật khẩu"
    }
];

let sql = "USE phone_db;\n\n";

let currentId = 15;
products.forEach(p => {
    const descJson = JSON.stringify([
        {type: "text", content: p.desc},
        {type: "image", content: p.image}
    ]).replace(/'/g, "''");

    const colorJson = JSON.stringify(p.colors).replace(/'/g, "''");
    const ramJson = JSON.stringify(p.rams).replace(/'/g, "''");

    sql += `UPDATE products SET 
        name = '${p.name.replace(/'/g, "''")}',
        price = ${p.price},
        old_price = ${p.old_price},
        description = '${descJson}',
        color_variants = '${colorJson}',
        ram_options = '${ramJson}',
        os = '${p.os}',
        cpu = '${p.cpu}',
        gpu = '${p.gpu}',
        ram = '${p.ram}',
        storage = '${p.storage}',
        screen = '${p.screen}',
        screen_tech = '${p.screen_tech}',
        camera = '${p.camera}',
        selfie = '${p.selfie}',
        battery = '${p.battery}',
        charging = '${p.charging}',
        security = '${p.security}'
    WHERE id = ${currentId};\n`;

    currentId++;
});

fs.writeFileSync('fix_data.sql', sql);
execSync('C:\\xampp\\mysql\\bin\\mysql.exe --default-character-set=utf8mb4 -u root < fix_data.sql');
console.log("Fixed!");
