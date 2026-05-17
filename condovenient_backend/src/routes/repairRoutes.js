const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

// 1. สร้างใบแจ้งซ่อมใหม่ (เปลี่ยนจาก /report เป็น /create ให้ตรงชื่อฟังก์ชัน)
router.post('/create', repairController.createRequest);

// 2. ดูรายการแจ้งซ่อมทั้งหมด
router.get('/list', repairController.getRepairList);

// 3. ดูรายการแจ้งซ่อมรายคน
router.get('/list/:userId', repairController.getRepairList);

module.exports = router;