const express = require('express');
const invoiceController = require('../controllers/invoiceController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, invoiceController.getInvoices);
router.get(
    '/:idFactura',
    authenticateToken,
    requireAdmin,
    invoiceController.invoiceIdValidation,
    invoiceController.getInvoiceById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    invoiceController.invoiceCreateValidation,
    invoiceController.createInvoice
);
router.put(
    '/:idFactura',
    authenticateToken,
    requireAdmin,
    [
        ...invoiceController.invoiceIdValidation,
        ...invoiceController.invoiceUpdateValidation
    ],
    invoiceController.updateInvoice
);
router.delete(
    '/:idFactura',
    authenticateToken,
    requireAdmin,
    invoiceController.invoiceIdValidation,
    invoiceController.deleteInvoice
);

module.exports = router;
