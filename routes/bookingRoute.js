const express = require('express');
const router = express.Router();
const bookingController = require('../controller/bookingController');

router.post('/hold', bookingController.holdSeat);
router.post('/confirm', bookingController.confirmSeat);
router.get('/seats', bookingController.getSeats);

module.exports = router;