const { db, admin } = require('../config/firebase');

// --- 1. ลูกบ้านส่งคะแนน ---
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

        if (ticketData.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'งานยังไม่เสร็จสิ้น ไม่สามารถให้คะแนนได้'
            });
        }

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

        await db.collection('repairTickets').doc(ticketId).update({
            ratingId: docRef.id,
            ratingScore: numericScore,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

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

// --- 2. ดู feedback ทั้งหมดที่ช่างคนหนึ่งได้รับ ---
exports.getRatingsByTechnician = async (req, res) => {
    try {
        const { technicianId } = req.params;
        let ratings = [];

        try {
            const snapshot = await db.collection('ratings')
                .where('technicianId', '==', technicianId)
                .orderBy('createdAt', 'desc')
                .get();
            snapshot.forEach(doc => {
                const data = doc.data();
                ratings.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                });
            });
        } catch (indexErr) {
            const snapshot = await db.collection('ratings')
                .where('technicianId', '==', technicianId)
                .get();
            snapshot.forEach(doc => {
                const data = doc.data();
                ratings.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
                });
            });
            ratings.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        }

        const totalScore = ratings.reduce((sum, r) => sum + (r.score || 0), 0);
        const averageScore = ratings.length > 0 ? (totalScore / ratings.length).toFixed(2) : 0;

        res.status(200).json({
            success: true,
            count: ratings.length,
            averageScore: parseFloat(averageScore),
            ratings
        });
    } catch (error) {
        console.error('getRatingsByTechnician error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 3. ดู rating ของ ticket รายตัว ---
exports.getRatingByTicket = async (req, res) => {
    try {
        const { ticketId } = req.params;
        const snapshot = await db.collection('ratings')
            .where('ticketId', '==', ticketId)
            .limit(1)
            .get();

        if (snapshot.empty) {
            return res.status(404).json({ success: false, message: 'ยังไม่มีการให้คะแนน' });
        }

        const doc = snapshot.docs[0];
        const data = doc.data();
        res.status(200).json({
            success: true,
            rating: {
                id: doc.id,
                ...data,
                createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};