const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

// 1. สร้างใบแจ้งซ่อมใหม่ (เปลี่ยนจาก /report เป็น /create ให้ตรงชื่อฟังก์ชัน)
router.post('/create', repairController.createRequest);

// 2. ดูรายการแจ้งซ่อม (ดูทั้งหมด หรือ ดูรายคน)
router.get('/list/:userId?', repairController.getRepairList);

// 3. มอบหมายช่าง (ใช้ PATCH เพราะเป็นการอัปเดตข้อมูลบางส่วนของ Ticket)
router.patch('/assign/:ticketId', repairController.assignTechnician);

// 4. ปิดงานซ่อม (เมื่อช่างทำงานเสร็จสิ้น)
router.patch('/close/:ticketId', repairController.closeRequest);

module.exports = router;