const { db, admin } = require('../config/firebase');

// --- จำลอง Bank API External Service ---
// ในโปรเจกต์จริงให้เปลี่ยนเป็น URL ของธนาคารจริง เช่น SCB, KBank
const BANK_API_URL = process.env.BANK_API_URL || 'https://mock-bank-api.example.com';
const BANK_API_KEY = process.env.BANK_API_KEY || 'mock-api-key';

// --- Helper: เรียก Bank API เพื่อตรวจสอบสถานะการชำระเงิน ---
async function verifyPaymentWithBank(paymentId) {
    try {
        // เรียก Bank API ด้วย fetch (Node 18+) หรือใช้ axios ถ้า install ไว้
        const response = await fetch(`${BANK_API_URL}/verify/${paymentId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${BANK_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            // ถ้า Bank API ตอบกลับ error ให้ throw เพื่อ catch ด้านนอก
            throw new Error(`Bank API Error: ${response.status}`);
        }

        const data = await response.json();
        // คาดว่า Bank API จะตอบกลับมาในรูปแบบ { status: 'success'|'pending'|'failed', amount, transactionRef }
        return data;

    } catch (error) {
        console.error('Bank API verification failed:', error.message);
        // ถ้าเรียก Bank API ไม่ได้ ให้ return สถานะ error กลับไป
        return { status: 'verification_failed', error: error.message };
    }
}

// --- 1. บันทึก Invoice / สร้างรายการชำระเงิน ---
exports.createInvoice = async (req, res) => {
    try {
        const { userId, roomId, amount, description, dueDate } = req.body;

        // สร้างข้อมูล Invoice ใหม่
        const invoiceData = {
            userId: userId,
            roomId: roomId,
            amount: parseFloat(amount),
            description: description || 'ค่าส่วนกลาง',
            dueDate: dueDate || '',
            status: 'pending',          // สถานะเริ่มต้น: รอชำระ
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        // บันทึกลง collection 'invoices'
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

// --- 2. ดึงรายการ Invoice ของ User ---
exports.getInvoices = async (req, res) => {
    try {
        const { userId } = req.params;

        const snapshot = await db.collection('invoices')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const invoices = [];
        snapshot.forEach(doc => invoices.push({ id: doc.id, ...doc.data() }));

        res.status(200).json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

// --- 3. บันทึกการชำระเงิน (เดิม processPayment ยังคงอยู่) ---
exports.processPayment = async (req, res) => {
    try {
        const { roomId, amount, paymentMethod, slipUrl } = req.body;

        // 1. เตรียมข้อมูลการชำระเงิน
        const paymentData = {
            roomId: roomId,
            amount: parseFloat(amount),
            paymentMethod: paymentMethod, // เช่น 'transfer' หรือ 'credit_card'
            slipUrl: slipUrl || '',        // ลิงก์รูปหลักฐานการโอน
            status: 'pending',            // เริ่มต้นเป็น 'รอตรวจสอบ'
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        // 2. บันทึกลง Collection "commonFees"
        const docRef = await db.collection('commonFees').add(paymentData);

        res.status(201).json({
            message: 'บันทึกการชำระเงินเรียบร้อยแล้ว รอเจ้าหน้าที่ตรวจสอบ',
            paymentId: docRef.id
        });

    } catch (error) {
        res.status(500).json({ error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

// --- 4. เรียก Bank API เพื่อตรวจสอบ Payment และอัปเดต Invoice ---
exports.verifyBankPayment = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const { invoiceId } = req.body; // invoiceId ที่ต้องการอัปเดตหลัง verify สำเร็จ

        // 1. เรียก Bank API ตรวจสอบสถานะ
        const bankResult = await verifyPaymentWithBank(paymentId);

        // 2. บันทึกผลการตรวจสอบจาก Bank ลง Firestore
        const verificationLog = {
            paymentId: paymentId,
            invoiceId: invoiceId || null,
            bankStatus: bankResult.status,
            bankResponse: JSON.stringify(bankResult),
            verifiedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        await db.collection('paymentVerifications').add(verificationLog);

        // 3. ถ้า Bank ยืนยันว่าชำระสำเร็จ → อัปเดต Invoice และสร้าง Receipt
        if (bankResult.status === 'success') {

            // อัปเดตสถานะ Invoice เป็น 'paid'
            if (invoiceId) {
                await db.collection('invoices').doc(invoiceId).update({
                    status: 'paid',
                    paidAt: admin.firestore.FieldValue.serverTimestamp(),
                    bankPaymentId: paymentId,
                    updatedAt: admin.firestore.FieldValue.serverTimestamp()
                });
            }

            // สร้าง Receipt อัตโนมัติ
            const receiptData = {
                paymentId: paymentId,
                invoiceId: invoiceId || null,
                amount: bankResult.amount || 0,
                transactionRef: bankResult.transactionRef || paymentId,
                status: 'issued',
                issuedAt: admin.firestore.FieldValue.serverTimestamp()
            };
            const receiptRef = await db.collection('receipts').add(receiptData);

            return res.status(200).json({
                success: true,
                message: 'ยืนยันการชำระเงินสำเร็จ ออก Receipt แล้ว',
                bankStatus: bankResult.status,
                receiptId: receiptRef.id
            });
        }

        // 4. ถ้าธนาคารยังรอหรือ failed
        res.status(200).json({
            success: false,
            message: `สถานะจากธนาคาร: ${bankResult.status}`,
            bankStatus: bankResult.status,
            bankResponse: bankResult
        });

    } catch (error) {
        res.status(500).json({ success: false, error: 'เกิดข้อผิดพลาด: ' + error.message });
    }
};

// --- 5. ดึง Receipt ของ Payment ---
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

// --- 6. ดึงประวัติการชำระเงิน (เดิม getPaymentHistory ยังคงอยู่) ---
exports.getPaymentHistory = async (req, res) => {
    try {
        const { roomId } = req.params;
        const snapshot = await db.collection('commonFees')
            .where('roomId', '==', roomId)
            .orderBy('createdAt', 'desc')
            .get();

        const history = [];
        snapshot.forEach(doc => history.push({ id: doc.id, ...doc.data() }));

        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};