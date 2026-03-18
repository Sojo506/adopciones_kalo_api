const express = require('express');
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, inventoryController.getInventories);
router.get(
    '/:idInventario',
    authenticateToken,
    requireAdmin,
    inventoryController.inventoryIdValidation,
    inventoryController.getInventoryById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    inventoryController.inventoryValidation,
    inventoryController.createInventory
);
router.put(
    '/:idInventario',
    authenticateToken,
    requireAdmin,
    [...inventoryController.inventoryIdValidation, ...inventoryController.inventoryValidation],
    inventoryController.updateInventory
);
router.delete(
    '/:idInventario',
    authenticateToken,
    requireAdmin,
    inventoryController.inventoryIdValidation,
    inventoryController.deleteInventory
);

module.exports = router;
