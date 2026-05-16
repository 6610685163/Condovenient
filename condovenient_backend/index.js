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

// paymentRoutes 
const paymentRoutes = require('./src/routes/paymentRoutes');
app.use('/api/payment', paymentRoutes);

// repairRoutes 
const repairRoutes = require('./src/routes/repairRoutes');
app.use('/api/repair', repairRoutes);

// visitorRoutes
const visitorRoutes = require('./src/routes/visitorRoutes');
app.use('/api/visitors', visitorRoutes);

// parcelRoutes
const parcelRoutes = require('./src/routes/parcelRoutes');
app.use('/api/parcel', parcelRoutes);

// accessLogRoutes
const accessLogRoutes = require('./src/routes/accessLogRoutes');
app.use('/api/access-log', accessLogRoutes);

// 3. Route สำหรับทดสอบ
app.get('/', (req, res) => {
    res.send('✅ Condovenient Backend is Running!');
});

// 4. สั่งรัน Server (เอาไว้ท้ายสุดของไฟล์)
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});