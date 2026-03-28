const admin = require('../config/firebase');
const db = admin.firestore();

// --- ฟังก์ชัน: สร้างใบแจ้งซ่อมใหม่ ---
exports.createRepairTicket = async (req, res) => {
    try {
        const { userId, roomNumber, title, description, priority, category } = req.body;

        const newTicket = {
            userId,
            roomNumber,
            title,
            description,
            category, // เช่น ประปา, ไฟฟ้า, แอร์
            priority: priority || 'normal', // low, normal, high
            status: 'pending', // สถานะเริ่มต้น
            imageAfter: '',    // รูปหลังซ่อมเสร็จ (ว่างไว้ก่อน)
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('repairTickets').add(newTicket);
        res.status(201).json({ message: 'ส่งเรื่องแจ้งซ่อมสำเร็จ!', ticketId: docRef.id });
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถส่งเรื่องได้: ' + error.message });
    }
};

// --- ฟังก์ชัน: ดึงรายการแจ้งซ่อม ---
exports.getRepairList = async (req, res) => {
    try {
        const { userId } = req.params;
        let query = db.collection('repairTickets');

        // ถ้าระบุ userId มา ให้ดึงแค่ของคนนั้น (ลูกบ้านดูของตัวเอง)
        // ถ้าไม่ระบุ ให้ดึงทั้งหมด (นิติบุคคลดูภาพรวม)
        if (userId) {
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

// --- ฟังก์ชัน: อัปเดตสถานะ ---
exports.updateRepairStatus = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const { status, note } = req.body; // status เช่น 'in-progress', 'completed'

        await db.collection('repairTickets').doc(ticketId).update({
            status: status,
            adminNote: note || '',
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({ message: 'อัปเดตสถานะการแจ้งซ่อมเรียบร้อย' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};