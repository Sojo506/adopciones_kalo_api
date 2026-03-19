const { body, param, validationResult } = require('express-validator');
const inventoryService = require('../services/inventoryService');

function validationErrorResponse(req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return null;
    }

    return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array()
    });
}

const inventoryIdValidation = [
    param('idInventario')
        .isInt({ min: 1 })
        .withMessage('ID Inventario must be a positive number')
];

const inventoryValidation = [
    body('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number'),
    body('cantidad')
        .isInt({ min: 0 })
        .withMessage('Cantidad must be a non-negative integer'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getInventories(req, res, next) {
    try {
        const inventories = await inventoryService.getInventories();

        res.status(200).json({
            ok: true,
            count: inventories.length,
            data: inventories
        });
    } catch (error) {
        next(error);
    }
}

async function getInventoryById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const inventory = await inventoryService.getInventoryById(req.params.idInventario);

        res.status(200).json({
            ok: true,
            data: inventory
        });
    } catch (error) {
        next(error);
    }
}

async function createInventory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const inventory = await inventoryService.createInventory(req.body);

        res.status(201).json({
            ok: true,
            message: 'Inventory created successfully',
            data: inventory
        });
    } catch (error) {
        next(error);
    }
}

async function updateInventory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const inventory = await inventoryService.updateInventory(
            req.params.idInventario,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Inventory updated successfully',
            data: inventory
        });
    } catch (error) {
        next(error);
    }
}

async function deleteInventory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await inventoryService.deleteInventory(req.params.idInventario);

        res.status(200).json({
            ok: true,
            message: 'Inventory deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory,
    inventoryIdValidation,
    inventoryValidation
};
