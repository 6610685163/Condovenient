const { admin, db } = require('../config/firebase');

exports.visitorCheckIn = async (req, res) => {
    try {
        // เพิ่มการรับค่า addedBy มาจากแอปหรือเว็บ
        const { visitorName, plateNumber, contactRoom, purpose, addedBy } = req.body;

        const visitorData = {
            visitorName,
            plateNumber,
            contactRoom,
            purpose,
            addedBy: addedBy || 'ไม่ระบุ', // <-- บันทึกคนทำรายการลงฐานข้อมูล
            checkInTime: admin.firestore.FieldValue.serverTimestamp(),
            checkOutTime: null,
            status: 'inside'
        };

        const docRef = await db.collection('visitors').add(visitorData);
        res.status(201).json({
            message: 'ลงทะเบียนเข้าเรียบร้อย',
            visitorId: docRef.id
        });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

exports.visitorCheckOut = async (req, res) => {
    try {
        const { visitorId } = req.params;

        await db.collection('visitors').doc(visitorId).update({
            checkOutTime: admin.firestore.FieldValue.serverTimestamp(),
            status: 'completed'
        });

        res.status(200).json({ message: 'ลงทะเบียนออกเรียบร้อยแล้ว' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getActiveVisitors = async (req, res) => {
    try {
        let activeVisitors = [];

        try {
            const snapshot = await db.collection('visitors')
                .where('status', '==', 'inside')
                .orderBy('checkInTime', 'desc')
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                activeVisitors.push({
                    id: doc.id,
                    ...data,
                    checkInTime: data.checkInTime
                        ? { _seconds: data.checkInTime.seconds, _nanoseconds: data.checkInTime.nanoseconds }
                        : null,
                    checkOutTime: data.checkOutTime
                        ? { _seconds: data.checkOutTime.seconds, _nanoseconds: data.checkOutTime.nanoseconds }
                        : null,
                });
            });

        } catch (indexErr) {
            console.warn('Visitor composite index not ready, using fallback:', indexErr.message);

            const snapshot = await db.collection('visitors')
                .where('status', '==', 'inside')
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                activeVisitors.push({
                    id: doc.id,
                    ...data,
                    checkInTime: data.checkInTime
                        ? { _seconds: data.checkInTime.seconds, _nanoseconds: data.checkInTime.nanoseconds }
                        : null,
                    checkOutTime: data.checkOutTime
                        ? { _seconds: data.checkOutTime.seconds, _nanoseconds: data.checkOutTime.nanoseconds }
                        : null,
                });
            });

            activeVisitors.sort((a, b) => {
                if (!a.checkInTime) return 1;
                if (!b.checkInTime) return -1;
                return b.checkInTime._seconds - a.checkInTime._seconds;
            });
        }

        res.status(200).json(activeVisitors);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getVisitorHistory = async (req, res) => {
    try {
        let history = [];

        try {
            const snapshot = await db.collection('visitors')
                .where('status', '==', 'completed')
                .orderBy('checkOutTime', 'desc')
                .limit(50)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                history.push({
                    id: doc.id,
                    ...data,
                    checkInTime: data.checkInTime
                        ? { _seconds: data.checkInTime.seconds, _nanoseconds: data.checkInTime.nanoseconds }
                        : null,
                    checkOutTime: data.checkOutTime
                        ? { _seconds: data.checkOutTime.seconds, _nanoseconds: data.checkOutTime.nanoseconds }
                        : null,
                });
            });

        } catch (indexErr) {
            console.warn('Visitor history index not ready, fallback:', indexErr.message);

            const snapshot = await db.collection('visitors')
                .where('status', '==', 'completed')
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                history.push({
                    id: doc.id,
                    ...data,
                    checkInTime: data.checkInTime
                        ? { _seconds: data.checkInTime.seconds, _nanoseconds: data.checkInTime.nanoseconds }
                        : null,
                    checkOutTime: data.checkOutTime
                        ? { _seconds: data.checkOutTime.seconds, _nanoseconds: data.checkOutTime.nanoseconds }
                        : null,
                });
            });

            history.sort((a, b) => {
                if (!a.checkOutTime) return 1;
                if (!b.checkOutTime) return -1;
                return b.checkOutTime._seconds - a.checkOutTime._seconds;
            });
        }

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};