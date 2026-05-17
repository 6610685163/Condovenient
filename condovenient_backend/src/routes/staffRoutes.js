const express = require('express');
const router = express.Router();
const staffController = require('../controllers/staffController');

router.get('/', staffController.getAllStaff);
router.get('/:userId/status', staffController.getStaffStatus);
router.patch('/:userId/status', staffController.updateWorkingStatus);
router.get('/:userId/status/history', staffController.getStatusHistory);

module.exports = router;