const { db, admin } = require('../config/firebase');

// 1. จำลองสถานะ Locker ให้หน้าแอป (ดึงข้อมูลให้ตรงกับ UI เดิม)
exports.getLockerStatus = async (req, res) => {
    try {
        // อนาคตสามารถเชื่อมตาราง lockers จริงๆ ได้ ตอนนี้ส่งค่าแบบ UI เดิมไปก่อน
        const lockerStatus = [1, 0, 2, 0, 0, 1, 2, 0, 0, 2, 0, 0];
        res.status(200).json({ success: true, lockerStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 2. ลงทะเบียนพัสดุใหม่ (นิติบุคคลเป็นคนใช้งานผ่านเว็บ)
exports.registerParcel = async (req, res) => {
    const { userId, carrier, lockerNumber } = req.body;
    
    try {
        const parcelData = {
            userId: userId,
            carrier: carrier || 'ไม่ระบุขนส่ง',
            lockerNumber: lockerNumber,
            status: 'arrived', // arrived, picked_up
            arrivedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('parcels').add(parcelData);

        // นำระบบ Notification ที่มีอยู่แล้วมาใช้ (notifyResident workflow)
        await db.collection('notifications').add({
            userId: userId,
            title: '📦 พัสดุใหม่มาถึงแล้ว',
            message: `พัสดุจาก ${carrier} ถูกเก็บไว้ที่ Locker #${lockerNumber} กรุณาสร้าง QR Code เพื่อรับพัสดุ`,
            type: 'general',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ success: true, parcelId: docRef.id, message: 'ลงทะเบียนพัสดุและแจ้งเตือนลูกบ้านแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 3. สร้าง QR Code สำหรับเปิดตู้ (ลูกบ้านกดจากมือถือ)
exports.generateQR = async (req, res) => {
    const { userId, lockerNumber } = req.body;

    try {
        // สร้าง Token สุ่มที่ปลอดภัย (จำลองการเข้ารหัส)
        const secureToken = Math.random().toString(36).substring(2, 15) + Date.now();
        
        // ข้อมูลที่จะถูกฝังใน QR Code
        const qrDataString = `token=${secureToken}&locker=${lockerNumber}&user=${userId}`;

        res.status(200).json({ 
            success: true, 
            qrData: qrDataString, // ส่งข้อความไปให้ Flutter วาด QR เอง
            expireInMins: 10
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};