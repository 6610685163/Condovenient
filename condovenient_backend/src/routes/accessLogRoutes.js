const express = require('express');
const router = express.Router();
const accessLogController = require('../controllers/accessLogController');

router.post('/log-entry', accessLogController.logEntry);
router.post('/log-exit', accessLogController.logExit);
router.get('/history', accessLogController.getAccessHistory);

module.exports = router;