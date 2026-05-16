const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcelController');

router.get('/status', parcelController.getLockerStatus);
router.get('/all', parcelController.getAllParcels);              // Admin: ดูพัสดุทั้งหมด
router.get('/user/:userId', parcelController.getUserParcels);   // App: ดูพัสดุของตัวเอง
router.post('/register', parcelController.registerParcel);       // Admin: ลงทะเบียนพัสดุ
router.post('/generate-qr', parcelController.generateQR);        // App: สร้าง QR
router.patch('/pickup/:parcelId', parcelController.markPickedUp); // App: ยืนยันรับพัสดุ

module.exports = router;
