const express = require('express');
const saleInvoiceController = require('../controllers/saleInvoiceController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, saleInvoiceController.getSaleInvoices);
router.get(
    '/:idVenta/:idFactura',
    authenticateToken,
    requireAdmin,
    saleInvoiceController.saleInvoiceKeyValidation,
    saleInvoiceController.getSaleInvoiceByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    saleInvoiceController.createSaleInvoiceValidation,
    saleInvoiceController.createSaleInvoice
);
router.put(
    '/:idVenta/:idFactura',
    authenticateToken,
    requireAdmin,
    [
        ...saleInvoiceController.saleInvoiceKeyValidation,
        ...saleInvoiceController.updateSaleInvoiceValidation
    ],
    saleInvoiceController.updateSaleInvoice
);
router.delete(
    '/:idVenta/:idFactura',
    authenticateToken,
    requireAdmin,
    saleInvoiceController.saleInvoiceKeyValidation,
    saleInvoiceController.deleteSaleInvoice
);

module.exports = router;
