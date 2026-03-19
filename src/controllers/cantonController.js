const { body, param, validationResult } = require('express-validator');
const cantonService = require('../services/cantonService');

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

const cantonIdValidation = [
    param('idCanton').isInt({ min: 1 }).withMessage('ID Canton must be a positive number')
];

const cantonBodyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idProvincia').isInt({ min: 1 }).withMessage('ID Provincia must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getCantons(req, res, next) {
    try {
        const cantons = await cantonService.getCantons();

        res.status(200).json({
            ok: true,
            count: cantons.length,
            data: cantons
        });
    } catch (error) {
        next(error);
    }
}

async function getCantonById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const canton = await cantonService.getCantonById(req.params.idCanton);

        res.status(200).json({
            ok: true,
            data: canton
        });
    } catch (error) {
        next(error);
    }
}

async function createCanton(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const canton = await cantonService.createCanton(req.body);

        res.status(201).json({
            ok: true,
            message: 'Canton created successfully',
            data: canton
        });
    } catch (error) {
        next(error);
    }
}

async function updateCanton(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const canton = await cantonService.updateCanton(req.params.idCanton, req.body);

        res.status(200).json({
            ok: true,
            message: 'Canton updated successfully',
            data: canton
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCanton(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await cantonService.deleteCanton(req.params.idCanton);

        res.status(200).json({
            ok: true,
            message: 'Canton deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCantons,
    getCantonById,
    createCanton,
    updateCanton,
    deleteCanton,
    cantonIdValidation,
    cantonBodyValidation
};
