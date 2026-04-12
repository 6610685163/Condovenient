const admin = require('../config/firebase');
const db = admin.firestore();

// --- ฟังก์ชัน: ลงทะเบียนเข้า (Check-in) ---
exports.visitorCheckIn = async (req, res) => {
    try {
        const { visitorName, plateNumber, contactRoom, purpose } = req.body;

        const visitorData = {
            visitorName,
            plateNumber,
            contactRoom,
            purpose,
            checkInTime: admin.firestore.FieldValue.serverTimestamp(),
            checkOutTime: null, // ยังไม่ได้ออก ให้เป็น null ไว้ก่อน
            status: 'inside'    // สถานะอยู่ในโครงการ
        };

        const docRef = await db.collection('visitors').add(visitorData);
        res.status(201).json({
            message: 'ลงทะเบียนเข้าเรียบร้อย',
            visitorId: docRef.id
        });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

// --- ฟังก์ชัน: ลงทะเบียนออก (Check-out) ---
exports.visitorCheckOut = async (req, res) => {
    try {
        const { visitorId } = req.params;

        await db.collection('visitors').doc(visitorId).update({
            checkOutTime: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed' // เปลี่ยนสถานะเป็นออกเรียบร้อย
        });

        res.status(200).json({ message: 'ลงทะเบียนออกเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- ฟังก์ชัน: ดึงรายชื่อคนที่ยังไม่กลับ ---
exports.getActiveVisitors = async (req, res) => {
    try {
        const snapshot = await db.collection('visitors')
            .where('status', '==', 'inside')
            .orderBy('checkInTime', 'desc')
            .get();

        const activeVisitors = [];
        snapshot.forEach(doc => activeVisitors.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(activeVisitors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};