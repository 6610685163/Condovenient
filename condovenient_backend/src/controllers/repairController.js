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

        // แจ้งเตือนเจ้าของห้องว่างานซ่อมเสร็จแล้ว
        await db.collection('notifications').add({
            userId: ticketData.userId,
            title: 'งานซ่อมเสร็จสิ้นแล้ว',
            message: `การแจ้งซ่อม "${ticketData.title}" เสร็จสิ้นแล้ว กรุณาตรวจรับงาน`,
            type: 'repair',
            ticketId: ticketId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'ปิดงานซ่อมและบันทึกข้อมูลเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถปิดงานได้: ' + error.message });
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