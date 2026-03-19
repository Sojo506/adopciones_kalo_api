const express = require('express');
const saleProductController = require('../controllers/saleProductController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, saleProductController.getSaleProducts);
router.get(
    '/:idVenta/:idProducto',
    authenticateToken,
    requireAdmin,
    saleProductController.saleProductKeyValidation,
    saleProductController.getSaleProductByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    saleProductController.createSaleProductValidation,
    saleProductController.createSaleProduct
);
router.put(
    '/:idVenta/:idProducto',
    authenticateToken,
    requireAdmin,
    [
        ...saleProductController.saleProductKeyValidation,
        ...saleProductController.updateSaleProductValidation
    ],
    saleProductController.updateSaleProduct
);
router.delete(
    '/:idVenta/:idProducto',
    authenticateToken,
    requireAdmin,
    saleProductController.saleProductKeyValidation,
    saleProductController.deleteSaleProduct
);

module.exports = router;
