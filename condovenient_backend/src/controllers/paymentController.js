const { db, admin } = require('../config/firebase');

const PAYMENT_MODE = process.env.PAYMENT_MODE || 'direct'; // 'direct' | 'bank_api'
const BANK_API_URL = process.env.BANK_API_URL || '';
const BANK_API_KEY = process.env.BANK_API_KEY || '';

exports.createInvoice = async (req, res) => {
    try {
        const { userId, roomId, amount, description, dueDate } = req.body;

        const invoiceData = {
            userId,
            roomId,
            amount: parseFloat(amount),
            description: description || 'ค่าส่วนกลาง',
            dueDate: dueDate || '',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const docRef = await db.collection('invoices').add(invoiceData);

        res.status(201).json({
            success: true,
            message: 'สร้าง Invoice เรียบร้อยแล้ว',
            invoiceId: docRef.id
        });
    } catch (error) {
        res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const { userId } = req.params;
        let invoices = [];

        try {
            const snapshot = await db.collection('invoices')
                .where('userId', '==', userId)
                .orderBy('createdAt', 'desc')
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                invoices.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
                    paidAt: data.paidAt ? data.paidAt.toDate().toISOString() : null,
                });
            });
        } catch (indexErr) {
            console.warn('Invoice composite index not ready, fallback:', indexErr.message);

            const snapshot = await db.collection('invoices')
                .where('userId', '==', userId)
                .get();

            snapshot.forEach(doc => {
                const data = doc.data();
                invoices.push({
                    id: doc.id,
                    ...data,
                    createdAt: data.createdAt ? data.createdAt.toDate().toISOString() : null,
                    updatedAt: data.updatedAt ? data.updatedAt.toDate().toISOString() : null,
                    paidAt: data.paidAt ? data.paidAt.toDate().toISOString() : null,
                });
            });

            invoices.sort((a, b) => {
                if (!a.createdAt) return 1;
                if (!b.createdAt) return -1;
                return new Date(b.createdAt) - new Date(a.createdAt);
            });
        }

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.processPayment = async (req, res) => {
    try {
        const { roomId, userId, amount, paymentMethod, slipUrl } = req.body;

        const paymentData = {
            roomId: roomId || '',
            userId: userId || '',
            amount: parseFloat(amount),
            paymentMethod: paymentMethod || 'transfer',
            slipUrl: slipUrl || '',
            status: 'pending',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        const docRef = await db.collection('commonFees').add(paymentData);

        res.status(201).json({
            message: 'บันทึกการชำระเงินเรียบร้อยแล้ว',
            paymentId: docRef.id
        });
    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

exports.verifyBankPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { invoiceId } = req.body;

        let bankStatus = 'success';

        if (PAYMENT_MODE === 'bank_api' && BANK_API_URL) {
            try {
                const response = await fetch(`${BANK_API_URL}/verify/${paymentId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${BANK_API_KEY}`,
                        'Content-Type': 'application/json'
                    }
                });
                const data = await response.json();
                bankStatus = data.status || 'failed';
            } catch (err) {
                return res.status(502).json({
                    success: false,
                    message: 'ไม่สามารถติดต่อระบบธนาคารได้ กรุณาลองใหม่อีกครั้ง',
                    error: err.message
                });
            }
        }
        // PAYMENT_MODE === 'direct' → ถือว่าชำระสำเร็จทันที

        await db.collection('paymentVerifications').add({
            paymentId,
            invoiceId: invoiceId || null,
            bankStatus,
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        if (bankStatus === 'success') {
            await db.collection('commonFees').doc(paymentId).update({
                status: 'paid',
                paidAt: admin.firestore.FieldValue.serverTimestamp(),
            }).catch(() => {});

            if (invoiceId) {
                await db.collection('invoices').doc(invoiceId).update({
                    status: 'paid',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    bankPaymentId: paymentId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            const receiptRef = await db.collection('receipts').add({
                paymentId,
                invoiceId: invoiceId || null,
                transactionRef: paymentId,
                status: 'issued',
                issuedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            return res.status(200).json({
                success: true,
                message: 'ยืนยันการชำระเงินสำเร็จ',
                bankStatus: 'success',
                receiptId: receiptRef.id
            });
        }

        res.status(200).json({
            success: false,
            message: `สถานะจากธนาคาร: ${bankStatus}`,
            bankStatus
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const { receiptId } = req.params;
        const receiptDoc = await db.collection('receipts').doc(receiptId).get();

        if (!receiptDoc.exists) {
            return res.status(404).json({ success: false, message: 'ไม่พบ Receipt นี้' });
        }

        res.status(200).json({ success: true, receipt: { id: receiptDoc.id, ...receiptDoc.data() } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

exports.getPaymentHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        let history = [];

        try {
            const snapshot = await db.collection('commonFees')
                .where('roomId', '==', roomId)
                .orderBy('createdAt', 'desc')
                .get();
            snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));
        } catch (indexErr) {
            const snapshot = await db.collection('commonFees')
                .where('roomId', '==', roomId)
                .get();
            snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));
            history.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        }

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};