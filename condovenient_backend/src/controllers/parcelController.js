const { db, admin } = require('../config/firebase');

// 1. ดึงสถานะ Locker จาก Firestore จริง (dynamic)
exports.getLockerStatus = async (req, res) => {
    try {
        const snapshot = await db.collection('parcels')
            .where('status', '==', 'arrived')
            .get();

        const lockerStatus = Array(12).fill(0);
        snapshot.forEach(doc => {
            const data = doc.data();
            const lockerNum = parseInt(data.lockerNumber);
            if (lockerNum >= 1 && lockerNum <= 12) {
                lockerStatus[lockerNum - 1] = 1;
            }
        });

        res.status(200).json({ success: true, lockerStatus });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 2. ดึงพัสดุทั้งหมด (Admin Web)
exports.getAllParcels = async (req, res) => {
    try {
        const snapshot = await db.collection('parcels')
            .orderBy('arrivedAt', 'desc')
            .get();

        const parcels = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            parcels.push({
                id: doc.id,
                ...data,
                arrivedAt: data.arrivedAt ? data.arrivedAt.toDate().toISOString() : null,
                pickedUpAt: data.pickedUpAt ? data.pickedUpAt.toDate().toISOString() : null,
            });
        });

        res.status(200).json({ success: true, parcels });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 3. ดึงพัสดุของ User คนเดียว (App ลูกบ้าน)
// หมายเหตุ: query userId + orderBy arrivedAt ต้องการ Composite Index ใน Firestore
// ถ้ายังไม่ได้สร้าง Index จะ fallback ดึงทั้งหมดแล้ว filter ฝั่ง server แทน
exports.getUserParcels = async (req, res) => {
    const { userId } = req.params;
    try {
        let parcels = [];

        try {
            // ลอง query ด้วย composite index ก่อน
            const snapshot = await db.collection('parcels')
                .where('userId', '==', userId)
                .orderBy('arrivedAt', 'desc')
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                parcels.push({
                    id: doc.id,
                    ...data,
                    arrivedAt: data.arrivedAt ? data.arrivedAt.toDate().toISOString() : null,
                    pickedUpAt: data.pickedUpAt ? data.pickedUpAt.toDate().toISOString() : null,
                });
            });
        } catch (indexErr) {
            // Fallback: ถ้า composite index ยังไม่ได้สร้าง ให้ query แบบไม่มี orderBy
            console.warn('Composite index not ready, using fallback query:', indexErr.message);
            const snapshot = await db.collection('parcels')
                .where('userId', '==', userId)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                parcels.push({
                    id: doc.id,
                    ...data,
                    arrivedAt: data.arrivedAt ? data.arrivedAt.toDate().toISOString() : null,
                    pickedUpAt: data.pickedUpAt ? data.pickedUpAt.toDate().toISOString() : null,
                });
            });

            // เรียงด้วย JavaScript แทน
            parcels.sort((a, b) => {
                if (!a.arrivedAt) return 1;
                if (!b.arrivedAt) return -1;
                return new Date(b.arrivedAt) - new Date(a.arrivedAt);
            });
        }

        res.status(200).json({ success: true, parcels });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 4. ลงทะเบียนพัสดุใหม่ + แจ้งเตือนอัตโนมัติ
exports.registerParcel = async (req, res) => {
    const { userId, carrier, lockerNumber } = req.body;

    if (!userId || !lockerNumber) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุ userId และ lockerNumber' });
    }

    try {
        const existingParcel = await db.collection('parcels')
            .where('lockerNumber', '==', String(lockerNumber))
            .where('status', '==', 'arrived')
            .get();

        if (!existingParcel.empty) {
            return res.status(400).json({ success: false, message: `Locker #${lockerNumber} ถูกใช้งานอยู่แล้ว` });
        }

        const userDoc = await db.collection('users').doc(userId).get();
        const userName = userDoc.exists ? (userDoc.data().name || 'ลูกบ้าน') : 'ลูกบ้าน';

        const parcelData = {
            userId,
            userName,
            carrier: carrier || 'ไม่ระบุขนส่ง',
            lockerNumber: String(lockerNumber),
            status: 'arrived',
            arrivedAt: admin.firestore.FieldValue.serverTimestamp(),
            pickedUpAt: null,
        };

        const docRef = await db.collection('parcels').add(parcelData);

        await db.collection('notifications').add({
            userId,
            title: '📦 พัสดุใหม่มาถึงแล้ว',
            message: `พัสดุจาก ${carrier || 'ขนส่ง'} ถูกเก็บไว้ที่ Locker #${lockerNumber} กรุณาเปิดแอปเพื่อรับพัสดุ`,
            type: 'general',
            parcelId: docRef.id,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(201).json({
            success: true,
            parcelId: docRef.id,
            message: `ลงทะเบียนพัสดุและแจ้งเตือน ${userName} แล้ว`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 5. สร้าง QR Code (ลูกบ้านกดจากแอป)
exports.generateQR = async (req, res) => {
    const { userId, parcelId } = req.body;

    if (!userId || !parcelId) {
        return res.status(400).json({ success: false, message: 'กรุณาระบุ userId และ parcelId' });
    }

    try {
        const parcelDoc = await db.collection('parcels').doc(parcelId).get();
        if (!parcelDoc.exists) return res.status(404).json({ success: false, message: 'ไม่พบพัสดุนี้' });

        const parcel = parcelDoc.data();
        if (parcel.userId !== userId) return res.status(403).json({ success: false, message: 'ไม่มีสิทธิ์เข้าถึงพัสดุนี้' });
        if (parcel.status !== 'arrived') return res.status(400).json({ success: false, message: 'พัสดุนี้ถูกรับไปแล้ว' });

        const secureToken = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        const expireAt = Date.now() + 10 * 60 * 1000;

        await db.collection('qrTokens').add({
            token: secureToken, userId, parcelId,
            lockerNumber: parcel.lockerNumber,
            expireAt: admin.firestore.Timestamp.fromMillis(expireAt),
            used: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        const qrData = JSON.stringify({
            token: secureToken,
            locker: parcel.lockerNumber,
            parcelId,
            exp: expireAt,
        });

        res.status(200).json({
            success: true,
            qrData,
            lockerNumber: parcel.lockerNumber,
            carrier: parcel.carrier,
            expireInMins: 10,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};

// 6. มาร์คว่ารับพัสดุแล้ว
exports.markPickedUp = async (req, res) => {
    const { parcelId } = req.params;
    try {
        const parcelDoc = await db.collection('parcels').doc(parcelId).get();
        if (!parcelDoc.exists) return res.status(404).json({ success: false, message: 'ไม่พบพัสดุนี้' });

        const parcel = parcelDoc.data();
        await db.collection('parcels').doc(parcelId).update({
            status: 'picked_up',
            pickedUpAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        await db.collection('notifications').add({
            userId: parcel.userId,
            title: '✅ รับพัสดุสำเร็จ',
            message: `คุณได้รับพัสดุจาก ${parcel.carrier} จาก Locker #${parcel.lockerNumber} แล้ว`,
            type: 'general',
            parcelId,
            isRead: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        res.status(200).json({ success: true, message: 'บันทึกการรับพัสดุเรียบร้อยแล้ว' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
};
