const express = require('express');
const trackingTypeController = require('../controllers/trackingTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, trackingTypeController.getTrackingTypes);
router.get(
    '/:idTipoSeguimiento',
    authenticateToken,
    requireAdmin,
    trackingTypeController.trackingTypeIdValidation,
    trackingTypeController.getTrackingTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    trackingTypeController.trackingTypeValidation,
    trackingTypeController.createTrackingType
);
router.put(
    '/:idTipoSeguimiento',
    authenticateToken,
    requireAdmin,
    [
        ...trackingTypeController.trackingTypeIdValidation,
        ...trackingTypeController.trackingTypeValidation
    ],
    trackingTypeController.updateTrackingType
);
router.delete(
    '/:idTipoSeguimiento',
    authenticateToken,
    requireAdmin,
    trackingTypeController.trackingTypeIdValidation,
    trackingTypeController.deleteTrackingType
);

module.exports = router;
