const express = require('express');
const refreshTokenController = require('../controllers/refreshTokenController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, refreshTokenController.getRefreshTokens);
router.get(
    '/:idRefreshToken',
    authenticateToken,
    requireAdmin,
    refreshTokenController.refreshTokenIdValidation,
    refreshTokenController.getRefreshTokenById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    refreshTokenController.refreshTokenBodyValidation,
    refreshTokenController.createRefreshToken
);
router.put(
    '/:idRefreshToken',
    authenticateToken,
    requireAdmin,
    [
        ...refreshTokenController.refreshTokenIdValidation,
        ...refreshTokenController.refreshTokenBodyValidation
    ],
    refreshTokenController.updateRefreshToken
);
router.delete(
    '/:idRefreshToken',
    authenticateToken,
    requireAdmin,
    refreshTokenController.refreshTokenIdValidation,
    refreshTokenController.deleteRefreshToken
);

module.exports = router;
