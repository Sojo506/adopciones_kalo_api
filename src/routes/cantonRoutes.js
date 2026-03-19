const express = require('express');
const cantonController = require('../controllers/cantonController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, cantonController.getCantons);
router.get(
    '/:idCanton',
    authenticateToken,
    requireAdmin,
    cantonController.cantonIdValidation,
    cantonController.getCantonById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    cantonController.cantonBodyValidation,
    cantonController.createCanton
);
router.put(
    '/:idCanton',
    authenticateToken,
    requireAdmin,
    [...cantonController.cantonIdValidation, ...cantonController.cantonBodyValidation],
    cantonController.updateCanton
);
router.delete(
    '/:idCanton',
    authenticateToken,
    requireAdmin,
    cantonController.cantonIdValidation,
    cantonController.deleteCanton
);

module.exports = router;
