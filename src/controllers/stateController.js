const { body, param, validationResult } = require('express-validator');
const stateService = require('../services/stateService');

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

const stateIdValidation = [
    param('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

const stateBodyValidation = [
    body('nombreEstado')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre Estado is required and must be at most 100 characters')
];

async function getStates(req, res, next) {
    try {
        const states = await stateService.getStates();

        res.status(200).json({
            ok: true,
            count: states.length,
            data: states
        });
    } catch (error) {
        next(error);
    }
}

async function getStateById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const state = await stateService.getStateById(req.params.idEstado);

        res.status(200).json({
            ok: true,
            data: state
        });
    } catch (error) {
        next(error);
    }
}

async function createState(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const state = await stateService.createState(req.body);

        res.status(201).json({
            ok: true,
            message: 'State created successfully',
            data: state
        });
    } catch (error) {
        next(error);
    }
}

async function updateState(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const state = await stateService.updateState(req.params.idEstado, req.body);

        res.status(200).json({
            ok: true,
            message: 'State updated successfully',
            data: state
        });
    } catch (error) {
        next(error);
    }
}

async function deleteState(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await stateService.deleteState(req.params.idEstado);

        res.status(200).json({
            ok: true,
            message: 'State deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getStates,
    getStateById,
    createState,
    updateState,
    deleteState,
    stateIdValidation,
    stateBodyValidation
};
