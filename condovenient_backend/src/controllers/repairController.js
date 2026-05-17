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