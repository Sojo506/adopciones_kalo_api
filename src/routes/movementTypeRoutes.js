const express = require('express');
const movementTypeController = require('../controllers/movementTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, movementTypeController.getMovementTypes);
router.get(
    '/:idTipoMovimiento',
    authenticateToken,
    requireAdmin,
    movementTypeController.movementTypeIdValidation,
    movementTypeController.getMovementTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    movementTypeController.movementTypeValidation,
    movementTypeController.createMovementType
);
router.put(
    '/:idTipoMovimiento',
    authenticateToken,
    requireAdmin,
    [
        ...movementTypeController.movementTypeIdValidation,
        ...movementTypeController.movementTypeValidation
    ],
    movementTypeController.updateMovementType
);
router.delete(
    '/:idTipoMovimiento',
    authenticateToken,
    requireAdmin,
    movementTypeController.movementTypeIdValidation,
    movementTypeController.deleteMovementType
);

module.exports = router;
