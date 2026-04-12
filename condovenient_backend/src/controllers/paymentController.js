const admin = require('../config/firebase'); // เรียกใช้กุญแจ Firebase ที่เราคุยกัน
const db = admin.firestore();

exports.processPayment = async (req, res) => {
    try {
        const { roomId, amount, paymentMethod, slipUrl } = req.body;

        // 1. เตรียมข้อมูลการชำระเงิน
        const paymentData = {
            roomId: roomId,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod, // เช่น 'transfer' หรือ 'credit_card'
            slipUrl: slipUrl || '',        // ลิงก์รูปหลักฐานการโอน
            status: 'pending',            // เริ่มต้นเป็น 'รอตรวจสอบ'
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. บันทึกลง Collection "commonFees"
        const docRef = await db.collection('commonFees').add(paymentData);

        res.status(201).json({
            message: 'บันทึกการชำระเงินเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ',
            paymentId: docRef.id
        });

    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const snapshot = await db.collection('commonFees')
            .where('roomId', '==', roomId)
            .orderBy('createdAt', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};