const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');

router.post('/check-in', visitorController.visitorCheckIn);
router.put('/check-out/:visitorId', visitorController.visitorCheckOut);
router.get('/active', visitorController.getActiveVisitors);
router.get('/history', visitorController.getVisitorHistory);

module.exports = router;