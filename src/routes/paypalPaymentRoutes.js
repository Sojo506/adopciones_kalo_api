const express = require('express');
const paypalPaymentController = require('../controllers/paypalPaymentController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, paypalPaymentController.getPayPalPayments);
router.get(
    '/:idPago',
    authenticateToken,
    requireAdmin,
    paypalPaymentController.paypalPaymentIdValidation,
    paypalPaymentController.getPayPalPaymentById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    paypalPaymentController.createPayPalPaymentValidation,
    paypalPaymentController.createPayPalPayment
);
router.put(
    '/:idPago',
    authenticateToken,
    requireAdmin,
    [
        ...paypalPaymentController.paypalPaymentIdValidation,
        ...paypalPaymentController.updatePayPalPaymentValidation
    ],
    paypalPaymentController.updatePayPalPayment
);
router.delete(
    '/:idPago',
    authenticateToken,
    requireAdmin,
    paypalPaymentController.paypalPaymentIdValidation,
    paypalPaymentController.deletePayPalPayment
);

module.exports = router;
