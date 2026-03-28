const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

// เส้นทางสำหรับแจ้งชำระค่าส่วนกลาง
router.post('/pay-common-fee', paymentController.processPayment);

// เส้นทางสำหรับดึงประวัติการชำระเงินของห้องนั้นๆ
router.get('/payment-history/:roomId', paymentController.getPaymentHistory);

module.exports = router;