const express = require('express');
const otpTypeController = require('../controllers/otpTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, otpTypeController.getOtpTypes);
router.get(
    '/:idTipoOtp',
    authenticateToken,
    requireAdmin,
    otpTypeController.otpTypeIdValidation,
    otpTypeController.getOtpTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    otpTypeController.otpTypeValidation,
    otpTypeController.createOtpType
);
router.put(
    '/:idTipoOtp',
    authenticateToken,
    requireAdmin,
    [...otpTypeController.otpTypeIdValidation, ...otpTypeController.otpTypeValidation],
    otpTypeController.updateOtpType
);
router.delete(
    '/:idTipoOtp',
    authenticateToken,
    requireAdmin,
    otpTypeController.otpTypeIdValidation,
    otpTypeController.deleteOtpType
);

module.exports = router;
