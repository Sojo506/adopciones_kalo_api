const { body, param, validationResult } = require('express-validator');
const inventoryMovementService = require('../services/inventoryMovementService');

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

const movementIdValidation = [
    param('idMovimiento')
        .isInt({ min: 1 })
        .withMessage('ID Movimiento must be a positive number')
];

const movementValidation = [
    body('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number'),
    body('idTipoMovimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Movimiento must be a positive number'),
    body('cantidad')
        .isInt({ min: 1 })
        .withMessage('Cantidad must be a positive integer'),
    body('fechaMovimiento')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Fecha Movimiento must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getInventoryMovements(req, res, next) {
    try {
        const movements = await inventoryMovementService.getInventoryMovements();

        res.status(200).json({
            ok: true,
            count: movements.length,
            data: movements
        });
    } catch (error) {
        next(error);
    }
}

async function getInventoryMovementById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movement = await inventoryMovementService.getInventoryMovementById(
            req.params.idMovimiento
        );

        res.status(200).json({
            ok: true,
            data: movement
        });
    } catch (error) {
        next(error);
    }
}

async function getActiveMovementTypes(req, res, next) {
    try {
        const movementTypes = await inventoryMovementService.getActiveMovementTypes();

        res.status(200).json({
            ok: true,
            count: movementTypes.length,
            data: movementTypes
        });
    } catch (error) {
        next(error);
    }
}

async function createInventoryMovement(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movement = await inventoryMovementService.createInventoryMovement(req.body);

        res.status(201).json({
            ok: true,
            message: 'Inventory movement created successfully',
            data: movement
        });
    } catch (error) {
        next(error);
    }
}

async function updateInventoryMovement(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movement = await inventoryMovementService.updateInventoryMovement(
            req.params.idMovimiento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Inventory movement updated successfully',
            data: movement
        });
    } catch (error) {
        next(error);
    }
}

async function deleteInventoryMovement(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await inventoryMovementService.deleteInventoryMovement(req.params.idMovimiento);

        res.status(200).json({
            ok: true,
            message: 'Inventory movement deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInventoryMovements,
    getInventoryMovementById,
    getActiveMovementTypes,
    createInventoryMovement,
    updateInventoryMovement,
    deleteInventoryMovement,
    movementIdValidation,
    movementValidation
};
