const { db, admin } = require('../config/firebase');

const ALLOWED_STATUSES = ['online', 'working', 'break', 'offline'];

// --- 1. ดึงรายการ staff/technician ทั้งหมด ---
exports.getAllStaff = async (req, res) => {
    try {
        const { role } = req.query;
        const usersRef = db.collection('users');
        let snapshot;

        if (role) {
            snapshot = await usersRef.where('role', '==', role).get();
        } else {
            snapshot = await usersRef
                .where('role', 'in', ['staff', 'technician'])
                .get();
        }

        const staffList = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            staffList.push({
                id: doc.id,
                username: data.username,
                name: data.name,
                role: data.role,
                workingStatus: data.workingStatus || 'offline',
                lastStatusUpdate: data.lastStatusUpdate
                    ? data.lastStatusUpdate.toDate().toISOString()
                    : null
            });
        });

        res.status(200).json({ success: true, staff: staffList });
    } catch (error) {
        console.error('getAllStaff error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 2. ดูสถานะการทำงานรายคน ---
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
                lastStatusUpdate: data.lastStatusUpdate
                    ? data.lastStatusUpdate.toDate().toISOString()
                    : null
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 3. อัปเดตสถานะการทำงาน ---
exports.updateWorkingStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { status } = req.body;

        if (!ALLOWED_STATUSES.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `สถานะไม่ถูกต้อง (อนุญาตเฉพาะ: ${ALLOWED_STATUSES.join(', ')})`
            });
        }

        const userRef = db.collection('users').doc(userId);
        const userDoc = await userRef.get();
        if (!userDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบผู้ใช้งานนี้' });
        }

        await userRef.update({
            workingStatus: status,
            lastStatusUpdate: admin.firestore.FieldValue.serverTimestamp()
        });

        await db.collection('staffStatusLogs').add({
            userId,
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(200).json({
            success: true,
            message: `อัปเดตสถานะเป็น "${status}" เรียบร้อยแล้ว`,
            workingStatus: status
        });
    } catch (error) {
        console.error('updateWorkingStatus error:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 4. ดูประวัติการเปลี่ยนสถานะ ---
exports.getStatusHistory = async (req, res) => {
    try {
        const { userId } = req.params;
        let logs = [];

        try {
            const snapshot = await db.collection('staffStatusLogs')
                .where('userId', '==', userId)
                .orderBy('updatedAt', 'desc')
                .limit(30)
                .get();
            snapshot.forEach(doc => {
                const data = doc.data();
                logs.push({
                    id: doc.id,
                    ...data,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
                });
            });
        } catch (indexErr) {
            const snapshot = await db.collection('staffStatusLogs')
                .where('userId', '==', userId)
                .get();
            snapshot.forEach(doc => {
                const data = doc.data();
                logs.push({
                    id: doc.id,
                    ...data,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null
                });
            });
            logs.sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0));
        }

        res.status(200).json({ success: true, logs });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};