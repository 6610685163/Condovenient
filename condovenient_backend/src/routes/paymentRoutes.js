const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// เส้นทางสำหรับแจ้งชำระค่าส่วนกลาง
router.post('/pay-common-fee', paymentController.processPayment);

// เส้นทางสำหรับดึงประวัติการชำระเงินของห้องนั้นๆ
router.get('/payment-history/:roomId', paymentController.getPaymentHistory);

// --- Routes สำหรับ Invoice ---
router.post('/invoices', paymentController.createInvoice);
router.get('/invoices/:userId', paymentController.getInvoices);

router.put('/invoices/:id', paymentController.updateInvoice);
router.delete('/invoices/:id', paymentController.deleteInvoice);

// --- Routes สำหรับ Bank API Verification และ Receipt ---
router.post('/verify/:paymentId', paymentController.verifyBankPayment);
router.get('/receipts/:receiptId', paymentController.getReceipt);

module.exports = router;