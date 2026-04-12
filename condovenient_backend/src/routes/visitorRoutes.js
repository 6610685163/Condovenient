const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

// 1. ลงทะเบียนผู้ติดต่อใหม่ (Check-in)
router.post('/check-in', visitorController.visitorCheckIn);

// 2. บันทึกเวลาออก (Check-out)
router.put('/check-out/:visitorId', visitorController.visitorCheckOut);

// 3. ดูรายการผู้ติดต่อที่ยังอยู่ในโครงการ (Still Inside)
router.get('/active', visitorController.getActiveVisitors);

module.exports = router;