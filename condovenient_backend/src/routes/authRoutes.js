const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/facebook-login', authController.facebookLogin);
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);
router.delete('/users/:id', authController.deleteUser);

// --- Routes สำหรับ Notification Service ---
// router.post('/notifications', authController.receiveNotification);
// router.get('/notifications/:userId', authController.getNotifications);
// router.patch('/notifications/:notificationId/read', authController.markNotificationRead);

module.exports = router;