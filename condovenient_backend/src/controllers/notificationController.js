// const admin = require('../config/firebase');
// const db = admin.firestore();

const { db, admin } = require('../config/firebase');

// --- ฟังก์ชัน: ส่ง In-app Notification ผ่าน FCM ---
exports.sendAppNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ error: 'กรุณาระบุ userId และ message' });
        }

        // 1. ดึง fcmToken ของผู้ใช้จาก Firestore
        const userDoc = await db.collection('User').doc(userId).get();
        if (!userDoc.exists) {
            return res.status(404).json({ error: 'ไม่พบข้อมูลผู้ใช้งาน' });
        }

        const userData = userDoc.data();
        const fcmToken = userData.fcmToken; // ตรวจสอบว่าในแอปเก็บชื่อฟิลด์นี้ไหม

        if (!fcmToken) {
            return res.status(400).json({ error: 'ผู้ใช้งานนี้ไม่มี fcmToken สำหรับแจ้งเตือน' });
        }

        // 2. จัดเตรียมโครงสร้างข้อความเพื่อส่งผ่าน Firebase Cloud Messaging
        const payload = {
            notification: {
                title: 'Condovenient Notification',
                body: message
            },
            token: fcmToken
        };

        // 3. สั่งส่งแจ้งเตือนไปยังอุปกรณ์พกพา
        const response = await admin.messaging().send(payload);

        res.status(200).json({
            success: true,
            message: 'ส่ง In-app Notification สำเร็จ',
            response
        });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

// --- ฟังก์ชัน: ส่ง SMS (Automated Alerts) ---
exports.sendSMS = async (req, res) => {
    try {
        const { phone, message } = req.body;

        if (!phone || !message) {
            return res.status(400).json({ error: 'กรุณาระบุ phone และ message' });
        }

        // ในสภาพแวดล้อมจริง จะต้องต่อ API กับผู้ให้บริการ SMS Gateway (เช่น AIS, True, Twilio, Thaibulksms)
        // ตรงนี้ทำเป็น Simulation Console Log ไว้ตามมาตรฐานการทดสอบ
        console.log(`[SMS Gateway] Sending message to ${phone}: ${message}`);

        res.status(200).json({
            success: true,
            message: `จำลองการส่ง SMS ไปยังเบอร์ ${phone} เรียบร้อยแล้ว`
        });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถส่ง SMS ได้: ' + error.message });
    }
};

// --- ฟังก์ชันเสริม: ยิงด่วนหาทีม Security เมื่อเกิด SecurityEvent ---
exports.notifySecurity = async (req, res) => {
    try {
        const { eventType, location, description } = req.body;

        // บันทึกประวัติเหตุการณ์ลงคอลเลกชัน SecurityEvent ตาม Class Diagram
        const eventLog = {
            eventType,
            eventTime: admin.firestore.FieldValue.serverTimestamp(),
            location,
            description: description || `เกิดเหตุการณ์ ${eventType} ที่บริเวณ ${location}`
        };

        const docRef = await db.collection('SecurityEvent').add(eventLog);

        // ส่ง Push Notification กลุ่มไปยัง Topic 'security_team' เพื่อเตือนภัยเจ้าหน้าที่ทุกคนทันที
        const payload = {
            notification: {
                title: `🚨 แจ้งเตือนเหตุการณ์: ${eventType}`,
                body: `สถานที่: ${location}`
            },
            topic: 'security_team'
        };

        await admin.messaging().send(payload);

        res.status(201).json({
            success: true,
            message: 'บันทึกเหตุการณ์และแจ้งเตือนทีมความปลอดภัยแล้ว',
            eventId: docRef.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Security alert failed: ' + error.message });
    }
};

exports.getNotifications = async (req, res) => {
    try {
        const { userId } = req.params;
        let query = db.collection('notifications');

        // ถ้าไม่ใช่ all ให้ดึงเฉพาะของคนนั้น
        if (userId !== 'all') {
            query = query.where('userId', '==', userId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const notifications = [];
        snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        // Fallback กรณี Index ยังไม่พร้อม
        try {
            const snapshot = await db.collection('notifications')
                .where('userId', '==', req.params.userId)
                .get();
            const notifications = [];
            snapshot.forEach(doc => notifications.push({ id: doc.id, ...doc.data() }));
            notifications.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            res.status(200).json({ success: true, notifications });
        } catch (fallbackErr) {
            res.status(500).json({ success: false, error: fallbackErr.message });
        }
    }
};

// --- เพิ่มใหม่: สร้างการแจ้งเตือนลง Database ---
exports.createNotification = async (req, res) => {
    try {
        const { userId, title, message, type, priority } = req.body;
        const docRef = await db.collection('notifications').add({
            userId,
            title,
            message,
            type: type || 'general',
            priority: priority || 'Normal',
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
        res.status(201).json({ success: true, message: 'ส่งแจ้งเตือนเรียบร้อย', notificationId: docRef.id });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- เพิ่มใหม่: มาร์คว่าอ่านแล้ว ---
exports.markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.collection('notifications').doc(id).update({ isRead: true });
        res.status(200).json({ success: true, message: 'ทำเครื่องหมายอ่านแล้ว' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};