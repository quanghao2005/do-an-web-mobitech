const fs = require('fs');

const categories = [
    { id: 1, name: 'iPhone' },
    { id: 2, name: 'Samsung' },
    { id: 3, name: 'Oppo' },
    { id: 4, name: 'REDMI' },
    { id: 5, name: 'NOKIA' }
];

const imageMap = {
    1: "https://images.unsplash.com/photo-1695048133142-1a20a5bf616f?q=80&w=2070&auto=format&fit=crop",
    2: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=2070&auto=format&fit=crop",
    3: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2070&auto=format&fit=crop",
    4: "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?q=80&w=2070&auto=format&fit=crop",
    5: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop"
};

const cpuMap = {
    1: "A16 Bionic / A17 Pro",
    2: "Snapdragon 8 Gen 3 / Exynos 2400",
    3: "Dimensity 9200 / Snapdragon 8 Gen 2",
    4: "Snapdragon 7+ Gen 2 / Dimensity 8200",
    5: "Snapdragon 480 / Unisoc T606"
};

const colors = JSON.stringify([
    {colorName: "Đen Nhám", hex: "#1c1c1c", imageUrl: ""},
    {colorName: "Trắng Sứ", hex: "#f0f0f0", imageUrl: ""},
    {colorName: "Xanh Titan", hex: "#4b536b", imageUrl: ""}
]).replace(/'/g, "\\'");

const ramOpts = JSON.stringify([
    {label: "8GB/256GB", extra: 0},
    {label: "12GB/512GB", extra: 3000000}
]).replace(/'/g, "\\'");

const desc = JSON.stringify([
    {type: "text", content: "Sản phẩm được thiết kế sang trọng, hiệu năng mạnh mẽ."},
    {type: "image", content: "https://images.unsplash.com/photo-1601784551446-20c9e07cd5d9?q=80&w=2070&auto=format&fit=crop"}
]).replace(/'/g, "\\'");

let sql = "USE phone_db;\n\n";

const modelSuffix = ["Pro", "Plus", "Ultra", "Max", "Lite"];

for (let i = 1; i <= 5; i++) {
    for (let j = 0; j < 5; j++) {
        let cat = categories[i-1];
        let price = Math.floor(Math.random() * 15) * 1000000 + 5000000;
        let oldPrice = price + 2000000;
        let name = `${cat.name} Series ${j+10} ${modelSuffix[j]}`;
        
        sql += `INSERT INTO products (name, price, old_price, description, image_url, color_variants, ram_options, os, cpu, gpu, ram, storage, screen, screen_tech, camera, selfie, battery, battery_type, charging, security, status, stock, created_at, category_id, brand_id) VALUES `;
        sql += `('${name}', ${price}, ${oldPrice}, '${desc}', '${imageMap[i]}', '${colors}', '${ramOpts}', 'Tùy chỉnh', '${cpuMap[i]}', 'Adreno / Mali', '8GB', '256GB', '6.7 inch', 'OLED', '50MP', '12MP', '5000mAh', 'Li-Po', 'Sạc nhanh', 'Vân tay', 1, 100, NOW(), ${i}, ${i});\n`;
    }
}

fs.writeFileSync('insert_25_products.sql', sql);
