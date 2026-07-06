const fs = require('fs');

const products = [
    // iPhone (Category 1)
    {
        name: "iPhone 15 Pro Max",
        price: 34990000,
        old_price: 36990000,
        desc: "Titanium siêu nhẹ. Cảm biến chính 48MP siêu nét. Chip A17 Pro mạnh mẽ nhất hiện nay.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Titan Tự Nhiên", hex: "#b4b1a8", imageUrl: ""}, {colorName: "Titan Xanh", hex: "#4b536b", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}, {label: "8GB/512GB", extra: 5000000}],
        os: "iOS 17", cpu: "Apple A17 Pro", gpu: "Apple GPU 6-core", ram: "8GB", storage: "256GB", screen: "6.7 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "4422mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 15 Pro", price: 28990000, old_price: 30990000, desc: "Sức mạnh từ chip A17 Pro, khung viền Titanium sang trọng.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Titan Đen", hex: "#2b2b2b", imageUrl: ""}, {colorName: "Titan Trắng", hex: "#f5f5f0", imageUrl: ""}],
        rams: [{label: "8GB/128GB", extra: 0}, {label: "8GB/256GB", extra: 3000000}],
        os: "iOS 17", cpu: "Apple A17 Pro", gpu: "Apple GPU 6-core", ram: "8GB", storage: "128GB", screen: "6.1 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "3274mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 15 Plus", price: 25990000, old_price: 27990000, desc: "Màn hình lớn 6.7 inch, thời lượng pin siêu khủng.",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Hồng", hex: "#fad2cd", imageUrl: ""}, {colorName: "Xanh dương", hex: "#cde2e7", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}, {label: "6GB/256GB", extra: 3000000}],
        os: "iOS 17", cpu: "Apple A16 Bionic", gpu: "Apple GPU 5-core", ram: "6GB", storage: "128GB", screen: "6.7 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP", selfie: "12MP", battery: "4383mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 15", price: 22990000, old_price: 24990000, desc: "Camera 48MP siêu nét, Dynamic Island độc đáo.",
        image: "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen", hex: "#353638", imageUrl: ""}, {colorName: "Xanh lá", hex: "#ceddd0", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}],
        os: "iOS 17", cpu: "Apple A16 Bionic", gpu: "Apple GPU 5-core", ram: "6GB", storage: "128GB", screen: "6.1 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP", selfie: "12MP", battery: "3349mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },
    {
        name: "iPhone 14 Pro Max", price: 29490000, old_price: 32990000, desc: "Cựu vương vẫn vô cùng mạnh mẽ với thiết kế thép không gỉ.",
        image: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Tím Đậm", hex: "#4b3d54", imageUrl: ""}, {colorName: "Vàng", hex: "#f3e5c9", imageUrl: ""}],
        rams: [{label: "6GB/128GB", extra: 0}],
        os: "iOS 16", cpu: "Apple A16 Bionic", gpu: "Apple GPU 5-core", ram: "6GB", storage: "128GB", screen: "6.7 inch", screen_tech: "Super Retina XDR OLED", camera: "48MP + 12MP + 12MP", selfie: "12MP", battery: "4323mAh", charging: "Sạc nhanh 20W", security: "Face ID"
    },

    // Samsung (Category 2)
    {
        name: "Samsung Galaxy S24 Ultra", price: 33990000, old_price: 36990000, desc: "Quyền năng Galaxy AI, camera mắt thần bóng đêm 200MP.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Titan Xám", hex: "#6c6a65", imageUrl: ""}, {colorName: "Titan Đen", hex: "#2f2e2d", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}, {label: "12GB/512GB", extra: 4000000}],
        os: "Android 14", cpu: "Snapdragon 8 Gen 3 For Galaxy", gpu: "Adreno 750", ram: "12GB", storage: "256GB", screen: "6.8 inch", screen_tech: "Dynamic AMOLED 2X", camera: "200MP + 50MP + 12MP + 10MP", selfie: "12MP", battery: "5000mAh", charging: "Sạc siêu nhanh 45W", security: "Vân tay siêu âm"
    },
    {
        name: "Samsung Galaxy S24+", price: 26990000, old_price: 29990000, desc: "Màn hình phẳng tràn viền, trải nghiệm AI thông minh.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Tím Cobalt", hex: "#8a7d97", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}],
        os: "Android 14", cpu: "Exynos 2400", gpu: "Xclipse 940", ram: "12GB", storage: "256GB", screen: "6.7 inch", screen_tech: "Dynamic AMOLED 2X", camera: "50MP + 12MP + 10MP", selfie: "12MP", battery: "4900mAh", charging: "Sạc siêu nhanh 45W", security: "Vân tay siêu âm"
    },
    {
        name: "Samsung Galaxy Z Fold5", price: 40990000, old_price: 44990000, desc: "Tuyệt tác điện thoại gập, đa nhiệm mượt mà.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Icy", hex: "#d0e4e9", imageUrl: ""}, {colorName: "Đen Phantom", hex: "#2b2b2b", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2 For Galaxy", gpu: "Adreno 740", ram: "12GB", storage: "256GB", screen: "7.6 inch & 6.2 inch", screen_tech: "Dynamic AMOLED 2X", camera: "50MP + 12MP + 10MP", selfie: "10MP & 4MP", battery: "4400mAh", charging: "Sạc siêu nhanh 25W", security: "Vân tay cạnh viền"
    },
    {
        name: "Samsung Galaxy Z Flip5", price: 25990000, old_price: 28990000, desc: "Màn hình ngoài Flex Window kích thước lớn, gập mở phong cách.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Mint", hex: "#ccdfd1", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2 For Galaxy", gpu: "Adreno 740", ram: "8GB", storage: "256GB", screen: "6.7 inch & 3.4 inch", screen_tech: "Dynamic AMOLED 2X", camera: "12MP + 12MP", selfie: "10MP", battery: "3700mAh", charging: "Sạc nhanh 25W", security: "Vân tay cạnh viền"
    },
    {
        name: "Samsung Galaxy A55 5G", price: 10490000, old_price: 11490000, desc: "Thiết kế viền kim loại cao cấp, camera chống rung OIS.",
        image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Đen", hex: "#242f3f", imageUrl: ""}],
        rams: [{label: "8GB/128GB", extra: 0}],
        os: "Android 14", cpu: "Exynos 1480", gpu: "Xclipse 530", ram: "8GB", storage: "128GB", screen: "6.6 inch", screen_tech: "Super AMOLED 120Hz", camera: "50MP + 12MP + 5MP", selfie: "32MP", battery: "5000mAh", charging: "Sạc nhanh 25W", security: "Vân tay quang học"
    },

    // Oppo (Category 3)
    {
        name: "OPPO Find N3", price: 44990000, old_price: 48990000, desc: "Điện thoại gập siêu mỏng nhẹ, camera Hasselblad đỉnh cao.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Vàng", hex: "#e5d4b8", imageUrl: ""}],
        rams: [{label: "16GB/512GB", extra: 0}],
        os: "Android 13", cpu: "Snapdragon 8 Gen 2", gpu: "Adreno 740", ram: "16GB", storage: "512GB", screen: "7.82 inch & 6.31 inch", screen_tech: "AMOLED 120Hz", camera: "48MP + 64MP + 48MP", selfie: "20MP & 32MP", battery: "4805mAh", charging: "SUPERVOOC 67W", security: "Vân tay cạnh viền"
    },
    {
        name: "OPPO Find N3 Flip", price: 22990000, old_price: 24990000, desc: "Thiết kế thời trang, cụm 3 camera hợp tác Hasselblad.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Đen", hex: "#222222", imageUrl: ""}],
        rams: [{label: "12GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Dimensity 9200", gpu: "Immortalis-G715 MC11", ram: "12GB", storage: "256GB", screen: "6.8 inch", screen_tech: "AMOLED 120Hz", camera: "50MP + 48MP + 32MP", selfie: "32MP", battery: "4300mAh", charging: "SUPERVOOC 44W", security: "Vân tay cạnh viền"
    },
    {
        name: "OPPO Reno11 Pro 5G", price: 16990000, old_price: 18990000, desc: "Chuyên gia chân dung, thiết kế lấy cảm hứng từ thiên nhiên.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Trắng Ngọc Trai", hex: "#f8f9fa", imageUrl: ""}],
        rams: [{label: "12GB/512GB", extra: 0}],
        os: "Android 14", cpu: "Dimensity 8200", gpu: "Mali-G610 MC6", ram: "12GB", storage: "512GB", screen: "6.7 inch", screen_tech: "AMOLED 3D cong", camera: "50MP + 32MP + 8MP", selfie: "32MP", battery: "4600mAh", charging: "SUPERVOOC 80W", security: "Vân tay dưới màn hình"
    },
    {
        name: "OPPO Reno11 5G", price: 10990000, old_price: 11990000, desc: "Camera tele chân dung 2x siêu nét, sạc nhanh 67W.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Xanh Sóng Biển", hex: "#7eb4b2", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 14", cpu: "Dimensity 7050", gpu: "Mali-G68 MC4", ram: "8GB", storage: "256GB", screen: "6.7 inch", screen_tech: "AMOLED 3D cong", camera: "50MP + 32MP + 8MP", selfie: "32MP", battery: "5000mAh", charging: "SUPERVOOC 67W", security: "Vân tay dưới màn hình"
    },
    {
        name: "OPPO A79 5G", price: 7490000, old_price: 8490000, desc: "Thiết kế mặt lưng lấp lánh, loa kép âm thanh sống động.",
        image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
        colors: [{colorName: "Tím Dạ Quang", hex: "#9b7ed6", imageUrl: ""}],
        rams: [{label: "8GB/256GB", extra: 0}],
        os: "Android 13", cpu: "Dimensity 6020", gpu: "Mali-G57 MC2", ram: "8GB", storage: "256GB", screen: "6.72 inch", screen_tech: "IPS LCD 90Hz", camera: "50MP + 2MP", selfie: "8MP", battery: "5000mAh", charging: "SUPERVOOC 33W", security: "Vân tay cạnh viền"
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
        colors: [{colorName: "Đen", hex: "#222", imageUrl: ""}],
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

// The products currently generated are ID from 15 to 39.
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

fs.writeFileSync('update_realistic.sql', sql);
