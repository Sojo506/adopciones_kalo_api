const express = require('express');
const donationInvoiceController = require('../controllers/donationInvoiceController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, donationInvoiceController.getDonationInvoices);
router.get(
    '/:idDonacion/:idFactura',
    authenticateToken,
    requireAdmin,
    donationInvoiceController.donationInvoiceKeyValidation,
    donationInvoiceController.getDonationInvoiceByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    donationInvoiceController.createDonationInvoiceValidation,
    donationInvoiceController.createDonationInvoice
);
router.put(
    '/:idDonacion/:idFactura',
    authenticateToken,
    requireAdmin,
    [
        ...donationInvoiceController.donationInvoiceKeyValidation,
        ...donationInvoiceController.updateDonationInvoiceValidation
    ],
    donationInvoiceController.updateDonationInvoice
);
router.delete(
    '/:idDonacion/:idFactura',
    authenticateToken,
    requireAdmin,
    donationInvoiceController.donationInvoiceKeyValidation,
    donationInvoiceController.deleteDonationInvoice
);

module.exports = router;
