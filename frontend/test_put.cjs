const axios = require('axios');

async function test() {
    try {
        const product = {
            id: 39,
            name: "Nokia 105 4G Pro",
            price: 850000,
            oldPrice: 990000,
            stock: 100,
            imageUrl: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37",
            description: "[]",
            ramOptions: "[]",
            category: { id: 5 },
            brand: { id: 5 },
            os: "S30+",
            cpu: "Unisoc T107",
            gpu: "Khong co",
            ram: "48MB",
            storage: "128MB",
            screen: "1.8 inch",
            screenTech: "QQVGA",
            camera: "Khong co",
            selfie: "Khong co",
            battery: "1450mAh",
            batteryType: "Li-Po",
            charging: "Sac MicroUSB",
            security: "Mat khau",
            colorVariants: "[]",
            status: 1
        };
        const res = await axios.put('http://localhost:8080/api/products/39', product);
        console.log(res.status, res.data);
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
