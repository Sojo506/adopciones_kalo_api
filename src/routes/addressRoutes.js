const express = require('express');
const addressController = require('../controllers/addressController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, addressController.getAddresses);
router.get(
    '/:idDireccion',
    authenticateToken,
    requireAdmin,
    addressController.addressIdValidation,
    addressController.getAddressById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    addressController.addressBodyValidation,
    addressController.createAddress
);
router.put(
    '/:idDireccion',
    authenticateToken,
    requireAdmin,
    [...addressController.addressIdValidation, ...addressController.addressBodyValidation],
    addressController.updateAddress
);
router.delete(
    '/:idDireccion',
    authenticateToken,
    requireAdmin,
    addressController.addressIdValidation,
    addressController.deleteAddress
);

module.exports = router;
