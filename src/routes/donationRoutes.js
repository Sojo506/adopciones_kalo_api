const express = require('express');
const donationController = require('../controllers/donationController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Public endpoint — requires auth but not admin
router.post(
    '/public',
    authenticateToken,
    donationController.publicDonationValidation,
    donationController.createPublicDonation
);

router.get('/', authenticateToken, requireAdmin, donationController.getDonations);
router.get(
    '/:idDonacion',
    authenticateToken,
    requireAdmin,
    donationController.donationIdValidation,
    donationController.getDonationById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    donationController.donationValidation,
    donationController.createDonation
);
router.put(
    '/:idDonacion',
    authenticateToken,
    requireAdmin,
    [...donationController.donationIdValidation, ...donationController.donationValidation],
    donationController.updateDonation
);
router.delete(
    '/:idDonacion',
    authenticateToken,
    requireAdmin,
    donationController.donationIdValidation,
    donationController.deleteDonation
);

module.exports = router;
