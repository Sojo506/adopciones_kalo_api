const express = require('express');
const paypalCheckoutController = require('../controllers/paypalCheckoutController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

// Both endpoints require an authenticated user (not necessarily admin)
router.post(
    '/orders',
    authenticateToken,
    paypalCheckoutController.createOrderValidation,
    paypalCheckoutController.createOrder
);

router.post(
    '/capture',
    authenticateToken,
    paypalCheckoutController.captureOrderValidation,
    paypalCheckoutController.captureOrder
);

module.exports = router;
