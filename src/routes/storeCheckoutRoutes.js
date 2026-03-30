const express = require('express');
const storeCheckoutController = require('../controllers/storeCheckoutController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.post(
    '/orders',
    authenticateToken,
    storeCheckoutController.createOrderValidation,
    storeCheckoutController.createOrder
);

router.post(
    '/capture',
    authenticateToken,
    storeCheckoutController.captureOrderValidation,
    storeCheckoutController.captureOrder
);

module.exports = router;
