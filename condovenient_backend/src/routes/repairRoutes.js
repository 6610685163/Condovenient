const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

// 1. ลูกบ้านส่งเรื่องแจ้งซ่อมใหม่
router.post('/report', repairController.createRepairTicket);

// 2. ดูรายการแจ้งซ่อมทั้งหมด (สำหรับนิติ/ช่าง) หรือดูเฉพาะของตัวเอง (สำหรับลูกบ้าน)
router.get('/list/:userId?', repairController.getRepairList);

// 3. อัปเดตสถานะการซ่อม (เช่น ช่างรับงานแล้ว หรือ ซ่อมเสร็จแล้ว)
router.put('/update-status/:ticketId', repairController.updateRepairStatus);

module.exports = router;