const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/:userId/status', staffController.getStaffStatus);
router.patch('/:userId/status', staffController.updateWorkingStatus);

module.exports = router;