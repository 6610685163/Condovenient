const admin = require('../config/firebase');
const db = admin.firestore();

// --- ฟังก์ชัน: บันทึกประวัติการเข้า (Create Log Entry) ---
exports.logEntry = async (req, res) => {
    try {
        const { visitorId, plateNumber, type } = req.body; // type: 'visitor' หรือ 'resident'

        const logData = {
            targetId: visitorId || null, // เชื่อมกับ ID ใน collection visitors
            plateNumber: plateNumber.replace(/\s+/g, ''),
            type: type || 'visitor',
            entryTime: admin.firestore.FieldValue.serverTimestamp(),
            exitTime: null,
            actionBy: req.user ? req.user.name : 'Security Gate', // ใครเป็นคนปล่อยเข้า
            status: 'active'
        };

        const docRef = await db.collection('access_logs').add(logData);

        res.status(201).json({
            success: true,
            logId: docRef.id,
            message: 'บันทึกเวลาเข้าลงทะเบียนประวัติแล้ว'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- ฟังก์ชัน: บันทึกประวัติการออก (Update Log Exit) ---
exports.logExit = async (req, res) => {
    try {
        const { plateNumber } = req.body;
        const normalizedPlate = plateNumber.replace(/\s+/g, '');

        // ค้นหา log ล่าสุดของรถคันนี้ที่ยังไม่ได้บันทึกเวลาออก
        const snapshot = await db.collection('access_logs')
            .where('plateNumber', '==', normalizedPlate)
            .where('exitTime', '==', null)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ message: 'ไม่พบประวัติการเข้าที่ยังค้างอยู่สำหรับรถคันนี้' });
        }

        const logId = snapshot.docs[0].id;

        await db.collection('access_logs').doc(logId).update({
            exitTime: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        });

        res.status(200).json({
            success: true,
            message: 'บันทึกเวลาออกลงประวัติเรียบร้อยแล้ว'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- ฟังก์ชัน: ดึงประวัติย้อนหลัง (Get History) ---
exports.getAccessHistory = async (req, res) => {
    try {
        const snapshot = await db.collection('access_logs')
            .orderBy('entryTime', 'desc')
            .limit(50) // ดึง 50 รายการล่าสุด
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};