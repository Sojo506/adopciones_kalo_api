const express = require('express');
const saleController = require('../controllers/saleController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, saleController.getSales);
router.get(
    '/:idVenta',
    authenticateToken,
    requireAdmin,
    saleController.saleIdValidation,
    saleController.getSaleById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    saleController.saleValidation,
    saleController.createSale
);
router.put(
    '/:idVenta',
    authenticateToken,
    requireAdmin,
    [...saleController.saleIdValidation, ...saleController.saleValidation],
    saleController.updateSale
);
router.delete(
    '/:idVenta',
    authenticateToken,
    requireAdmin,
    saleController.saleIdValidation,
    saleController.deleteSale
);

module.exports = router;
