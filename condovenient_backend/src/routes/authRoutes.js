const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/login', authController.login);
router.post('/google-login', authController.googleLogin);
router.post('/facebook-login', authController.facebookLogin);
router.post('/register', authController.register);
router.get('/users', authController.getAllUsers);
router.delete('/users/:id', authController.deleteUser);

module.exports = router;