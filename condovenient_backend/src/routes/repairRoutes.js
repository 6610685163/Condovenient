const express = require('express');
const router = express.Router();
const repairController = require('../controllers/repairController');

// 1. สร้างใบแจ้งซ่อมใหม่
router.post('/create', repairController.createRequest);

// 2. ดูรายการแจ้งซ่อมทั้งหมด
router.get('/list', repairController.getRepairList);

// 3. ดูรายการแจ้งซ่อมรายคน
router.get('/list/:userId', repairController.getRepairList);

// 4. มอบหมายช่าง (admin)
router.patch('/assign/:ticketId', repairController.assignTechnician);

// 5. ปิดงานซ่อม
router.patch('/close/:ticketId', repairController.closeRequest);

// 6. ช่างกดรับงานที่ได้รับมอบหมาย
router.patch('/accept/:ticketId', repairController.acceptJob);

// 7. ดูงานที่ช่างคนนั้นได้รับ
router.get('/technician/:technicianId', repairController.getJobsByTechnician);

module.exports = router;
