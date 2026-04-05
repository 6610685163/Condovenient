const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

// 1. Middleware (ตั้งค่าพื้นฐาน)
app.use(cors());
app.use(express.json()); // เรียกครั้งเดียวพอครับ

// 2. เรียก Routes (ต้องเรียกก่อน app.listen)
const authRoutes = require('./src/routes/authRoutes');
app.use('/api/auth', authRoutes);

// 3. Route สำหรับทดสอบ
app.get('/', (req, res) => {
    res.send('✅ Condovenient Backend is Running!');
});

// 4. สั่งรัน Server (เอาไว้ท้ายสุดของไฟล์)
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});