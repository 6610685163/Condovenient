const { db, admin } = require('../config/firebase');

// --- ดึงสถานะการทำงานของ staff/technician รายคน ---
exports.getStaffStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const userDoc = await db.collection('users').doc(userId).get();

        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        const data = userDoc.data();
        res.status(200).json({
            success: true,
            staff: {
                id: userDoc.id,
                name: data.name,
                role: data.role,
                workingStatus: data.workingStatus || 'offline',
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- อัปเดตสถานะการทำงาน ---
exports.updateWorkingStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        await userRef.update({
            workingStatus: status,
            lastStatusUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            success: true,
            message: `อัปเดตสถานะเป็น "${status}" เรียบร้อยแล้ว`,
            workingStatus: status
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};