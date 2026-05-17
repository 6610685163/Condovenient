const { db, admin } = require('../config/firebase');

// --- 1. ฟังก์ชัน: สร้างใบแจ้งซ่อมใหม่ (เดิมคือ createRepairTicket) ---
exports.createRequest = async (req, res) => {
    try {
        const { userId, roomNumber, title, description, priority, category } = req.body;

        const newTicket = {
            userId,
            roomNumber,
            title,
            description,
            category,
            priority: priority || 'normal',
            status: 'pending',
            technicianId: null, // เพิ่มไว้สำหรับรอการมอบหมาย
            technicianName: null,
            imageAfter: '',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('repairTickets').add(newTicket);

        // ส่ง Notification ให้ Admin/Staff รู้ว่ามีใบแจ้งซ่อมใหม่
        await db.collection('notifications').add({
            userId: 'admin',
            title: 'มีใบแจ้งซ่อมใหม่',
            message: `ห้อง ${roomNumber} แจ้งซ่อม: ${title}`,
            type: 'repair',
            ticketId: docRef.id,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ message: 'ส่งเรื่องแจ้งซ่อมสำเร็จ!', ticketId: docRef.id });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถส่งเรื่องได้: ' + error.message });
    }
};

// --- 2. ฟังก์ชัน: มอบหมายช่าง (assignTechnician) ---
exports.assignTechnician = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { technicianId, technicianName } = req.body;

        if (!technicianId) {
            return res.status(400).json({ error: 'กรุณาระบุข้อมูลช่าง' });
        }

        // ดึงข้อมูล ticket ก่อน เพื่อส่ง notification ให้เจ้าของห้อง
        const ticketDoc = await db.collection('repairTickets').doc(ticketId).get();
        if (!ticketDoc.exists) {
            return res.status(404).json({ error: 'ไม่พบใบแจ้งซ่อมนี้' });
        }
        const ticketData = ticketDoc.data();

        await db.collection('repairTickets').doc(ticketId).update({
            technicianId: technicianId,
            technicianName: technicianName || 'Unassigned Technician',
            status: 'assigned', // เปลี่ยนสถานะเป็นมอบหมายแล้ว
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // แจ้งเตือนเจ้าของห้องว่ามอบหมายช่างแล้ว
        await db.collection('notifications').add({
            userId: ticketData.userId,
            title: 'มอบหมายช่างแล้ว',
            message: `ช่าง ${technicianName || 'ที่ได้รับมอบหมาย'} จะเข้าดูแลงานซ่อมของคุณ`,
            type: 'repair',
            ticketId: ticketId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: `มอบหมายช่าง ${technicianName} เรียบร้อยแล้ว` });
    } catch (error) {
        res.status(500).json({ error: 'มอบหมายช่างไม่สำเร็จ: ' + error.message });
    }
};

// --- 3. ฟังก์ชัน: ปิดงานซ่อม (closeRequest) ---
exports.closeRequest = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { completionNote, imageAfterUrl } = req.body;

        // ดึงข้อมูล ticket เพื่อส่ง notification ให้เจ้าของห้อง
        const ticketDoc = await db.collection('repairTickets').doc(ticketId).get();
        if (!ticketDoc.exists) {
            return res.status(404).json({ error: 'ไม่พบใบแจ้งซ่อมนี้' });
        }
        const ticketData = ticketDoc.data();

        await db.collection('repairTickets').doc(ticketId).update({
            status: 'completed', // ปิดสถานะงาน
            completionNote: completionNote || 'งานเสร็จสิ้น',
            imageAfter: imageAfterUrl || '', // เก็บหลักฐานหลังซ่อม
            closedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // แจ้งเตือนเจ้าของห้องว่างานซ่อมเสร็จแล้ว + ขอให้กดให้คะแนน
        // ห่อด้วย try/catch แยก เพื่อให้การปิดงานยังถือว่าสำเร็จ แม้ notification หรือ FCM จะล้ม
        let notificationId = null;
        try {
            const notifRef = await db.collection('notifications').add({
                userId: ticketData.userId,
                title: 'งานซ่อมเสร็จสิ้นแล้ว',
                message: `การแจ้งซ่อม "${ticketData.title}" เสร็จสิ้นแล้ว กรุณาตรวจรับงานและให้คะแนนช่าง`,
                type: 'repair_completed',
                ticketId: ticketId,
                ticketTitle: ticketData.title || '',
                technicianId: ticketData.technicianId || null,
                technicianName: ticketData.technicianName || '',
                requiresRating: true,
                isRead: false,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
            notificationId = notifRef.id;
            console.log(`[closeRequest] Notification created: ${notificationId} for user ${ticketData.userId}`);
        } catch (notifErr) {
            console.error('[closeRequest] Notification write failed:', notifErr.message);
        }

        // ส่ง FCM push (best-effort) ให้ลูกบ้านเห็นแจ้งเตือนแบบ Real-time แม้แอปไม่ได้เปิด
        try {
            const userDoc = await db.collection('users').doc(ticketData.userId).get();
            const fcmToken = userDoc.exists ? userDoc.data().fcmToken : null;
            if (fcmToken) {
                await admin.messaging().send({
                    notification: {
                        title: 'งานซ่อมเสร็จสิ้นแล้ว',
                        body: `"${ticketData.title}" เสร็จสิ้นแล้ว แตะเพื่อให้คะแนนช่าง`
                    },
                    data: {
                        type: 'repair_completed',
                        ticketId: String(ticketId),
                        requiresRating: 'true'
                    },
                    token: fcmToken
                });
            }
        } catch (pushErr) {
            console.warn('[closeRequest] FCM push skipped:', pushErr.message);
        }

        res.status(200).json({
            message: 'ปิดงานซ่อมและบันทึกข้อมูลเรียบร้อย',
            notificationId
        });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถปิดงานได้: ' + error.message });
    }
};

// --- 4. ฟังก์ชัน: ช่างกดรับงานที่ได้รับมอบหมาย (acceptJob) ---
exports.acceptJob = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { technicianId } = req.body;

        const ticketRef = db.collection('repairTickets').doc(ticketId);
        const ticketDoc = await ticketRef.get();
        if (!ticketDoc.exists) {
            return res.status(404).json({ error: 'ไม่พบใบแจ้งซ่อมนี้' });
        }
        const ticketData = ticketDoc.data();

        // ต้องเป็นช่างที่ถูก assign จริง ๆ
        if (technicianId && ticketData.technicianId && ticketData.technicianId !== technicianId) {
            return res.status(403).json({ error: 'คุณไม่ใช่ช่างที่ได้รับมอบหมายงานนี้' });
        }

        if (ticketData.status !== 'assigned') {
            return res.status(400).json({
                error: `ไม่สามารถรับงานได้ (สถานะปัจจุบัน: ${ticketData.status})`
            });
        }

        await ticketRef.update({
            status: 'in_progress',
            acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // แจ้งเตือนเจ้าของห้องว่าช่างรับงานแล้ว
        await db.collection('notifications').add({
            userId: ticketData.userId,
            title: 'ช่างรับงานแล้ว',
            message: `ช่าง ${ticketData.technicianName || ''} กำลังเข้าดำเนินการ "${ticketData.title}"`,
            type: 'repair',
            ticketId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'รับงานเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ error: 'รับงานไม่สำเร็จ: ' + error.message });
    }
};



// --- (Option) ดึงรายการแจ้งซ่อมคงเดิม ---
exports.getRepairList = async (req, res) => {
    try {
        const { userId } = req.params;
        let query = db.collection('repairTickets');

        if (userId && userId !== 'all') {
            query = query.where('userId', '==', userId);
        }

        const snapshot = await query.orderBy('createdAt', 'desc').get();
        const tickets = [];
        snapshot.forEach(doc => tickets.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(tickets);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};