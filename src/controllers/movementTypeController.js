const { body, param, validationResult } = require('express-validator');
const movementTypeService = require('../services/movementTypeService');

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

const movementTypeIdValidation = [
    param('idTipoMovimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Movimiento must be a positive number')
];

const movementTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getMovementTypes(req, res, next) {
    try {
        const movementTypes = await movementTypeService.getMovementTypes();

        res.status(200).json({
            ok: true,
            count: movementTypes.length,
            data: movementTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getMovementTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movementType = await movementTypeService.getMovementTypeById(
            req.params.idTipoMovimiento
        );

        res.status(200).json({
            ok: true,
            data: movementType
        });
    } catch (error) {
        next(error);
    }
}

async function createMovementType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movementType = await movementTypeService.createMovementType(req.body);

        res.status(201).json({
            ok: true,
            message: 'Movement type created successfully',
            data: movementType
        });
    } catch (error) {
        next(error);
    }
}

async function updateMovementType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const movementType = await movementTypeService.updateMovementType(
            req.params.idTipoMovimiento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Movement type updated successfully',
            data: movementType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteMovementType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await movementTypeService.deleteMovementType(req.params.idTipoMovimiento);

        res.status(200).json({
            ok: true,
            message: 'Movement type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMovementTypes,
    getMovementTypeById,
    createMovementType,
    updateMovementType,
    deleteMovementType,
    movementTypeIdValidation,
    movementTypeValidation
};
