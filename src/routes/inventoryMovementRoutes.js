const express = require('express');
const inventoryMovementController = require('../controllers/inventoryMovementController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/types',
    authenticateToken,
    requireAdmin,
    inventoryMovementController.getActiveMovementTypes
);
router.get(
    '/',
    authenticateToken,
    requireAdmin,
    inventoryMovementController.getInventoryMovements
);
router.get(
    '/:idMovimiento',
    authenticateToken,
    requireAdmin,
    inventoryMovementController.movementIdValidation,
    inventoryMovementController.getInventoryMovementById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    inventoryMovementController.movementValidation,
    inventoryMovementController.createInventoryMovement
);
router.put(
    '/:idMovimiento',
    authenticateToken,
    requireAdmin,
    [
        ...inventoryMovementController.movementIdValidation,
        ...inventoryMovementController.movementValidation
    ],
    inventoryMovementController.updateInventoryMovement
);
router.delete(
    '/:idMovimiento',
    authenticateToken,
    requireAdmin,
    inventoryMovementController.movementIdValidation,
    inventoryMovementController.deleteInventoryMovement
);

module.exports = router;
