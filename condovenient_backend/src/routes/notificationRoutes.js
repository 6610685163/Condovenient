const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// ส่งแจ้งเตือนบนแอปรายบุคคล
router.post('/send-app', notificationController.sendAppNotification);

// ส่ง SMS แจ้งเตือนข้อความสำคัญ
router.post('/send-sms', notificationController.sendSMS);

// แจ้งเตือนเหตุการณ์ความไม่ปลอดภัย (Security Event)
router.post('/notify-security', notificationController.notifySecurity);

router.get('/:userId', notificationController.getNotifications);
router.post('/', notificationController.createNotification);
router.patch('/:id/read', notificationController.markAsRead);

module.exports = router;