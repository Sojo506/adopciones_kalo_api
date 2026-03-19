const express = require('express');
const otpController = require('../controllers/otpController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, otpController.getOtps);
router.get(
    '/:idCodigoOtp',
    authenticateToken,
    requireAdmin,
    otpController.otpIdValidation,
    otpController.getOtpById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    otpController.otpBodyValidation,
    otpController.createOtp
);
router.put(
    '/:idCodigoOtp',
    authenticateToken,
    requireAdmin,
    [...otpController.otpIdValidation, ...otpController.otpBodyValidation],
    otpController.updateOtp
);
router.delete(
    '/:idCodigoOtp',
    authenticateToken,
    requireAdmin,
    otpController.otpIdValidation,
    otpController.deleteOtp
);

module.exports = router;
