const express = require('express');
const currencyController = require('../controllers/currencyController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, currencyController.getCurrencies);
router.get(
    '/:idMoneda',
    authenticateToken,
    requireAdmin,
    currencyController.currencyIdValidation,
    currencyController.getCurrencyById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    currencyController.currencyValidation,
    currencyController.createCurrency
);
router.put(
    '/:idMoneda',
    authenticateToken,
    requireAdmin,
    [...currencyController.currencyIdValidation, ...currencyController.currencyValidation],
    currencyController.updateCurrency
);
router.delete(
    '/:idMoneda',
    authenticateToken,
    requireAdmin,
    currencyController.currencyIdValidation,
    currencyController.deleteCurrency
);

module.exports = router;
