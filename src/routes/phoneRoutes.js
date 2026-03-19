const express = require('express');
const phoneController = require('../controllers/phoneController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, phoneController.getPhones);
router.get(
    '/:identificacion/:telefono',
    authenticateToken,
    requireAdmin,
    phoneController.phoneKeyValidation,
    phoneController.getPhoneByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    phoneController.createPhoneValidation,
    phoneController.createPhone
);
router.put(
    '/:identificacion/:telefono',
    authenticateToken,
    requireAdmin,
    [...phoneController.phoneKeyValidation, ...phoneController.updatePhoneValidation],
    phoneController.updatePhone
);
router.delete(
    '/:identificacion/:telefono',
    authenticateToken,
    requireAdmin,
    phoneController.phoneKeyValidation,
    phoneController.deletePhone
);

module.exports = router;
