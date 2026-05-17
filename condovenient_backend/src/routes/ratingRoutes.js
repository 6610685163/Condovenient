const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

router.post('/', ratingController.submitRating);
router.get('/technician/:technicianId', ratingController.getRatingsByTechnician);
router.get('/ticket/:ticketId', ratingController.getRatingByTicket);

module.exports = router;