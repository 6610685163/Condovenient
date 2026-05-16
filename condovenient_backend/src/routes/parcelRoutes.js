const express = require('express');
const router = express.Router();
const parcelController = require('../controllers/parcelController');

// กำหนด Endpoints
router.get('/status', parcelController.getLockerStatus);
router.post('/register', parcelController.registerParcel);
router.post('/generate-qr', parcelController.generateQR);

module.exports = router;