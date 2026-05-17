const { db, admin } = require('../config/firebase');

// --- ลูกบ้านส่งคะแนน + คอมเมนต์หลังงานซ่อมเสร็จ ---
exports.submitRating = async (req, res) => {
    try {
        const { ticketId, userId, score, comment } = req.body;

        if (!ticketId || score === undefined) {
            return res.status(400).json({
                success: false,
                message: 'กรุณาระบุ ticketId และ score'
            });
        }

        const numericScore = parseInt(score, 10);
        if (isNaN(numericScore) || numericScore < 1 || numericScore > 5) {
            return res.status(400).json({
                success: false,
                message: 'คะแนนต้องเป็นเลข 1-5'
            });
        }

        const ticketDoc = await db.collection('repairTickets').doc(ticketId).get();
        if (!ticketDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบใบแจ้งซ่อมนี้' });
        }
        const ticketData = ticketDoc.data();

        const ratingData = {
            ticketId,
            userId: userId || ticketData.userId,
            technicianId: ticketData.technicianId || null,
            technicianName: ticketData.technicianName || null,
            score: numericScore,
            comment: comment || '',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('ratings').add(ratingData);

        res.status(201).json({
            success: true,
            message: 'บันทึกคะแนนเรียบร้อย ขอบคุณสำหรับ feedback',
            ratingId: docRef.id
        });
    } catch (error) {
        console.error('submitRating error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};