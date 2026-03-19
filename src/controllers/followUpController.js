const { body, param, validationResult } = require('express-validator');
const followUpService = require('../services/followUpService');

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

const followUpIdValidation = [
    param('idSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Seguimiento must be a positive number')
];

const createFollowUpValidation = [
    body('idAdopcion')
        .isInt({ min: 1 })
        .withMessage('ID Adopcion must be a positive number'),
    body('idTipoSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Seguimiento must be a positive number'),
    body('fechaInicio')
        .isISO8601()
        .withMessage('Start date must be a valid ISO-8601 date'),
    body('fechaFin')
        .isISO8601()
        .withMessage('End date must be a valid ISO-8601 date'),
    body('comentarios')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comentarios must be at most 500 characters'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateFollowUpValidation = [
    body('idAdopcion')
        .isInt({ min: 1 })
        .withMessage('ID Adopcion must be a positive number'),
    body('idTipoSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Seguimiento must be a positive number'),
    body('fechaInicio')
        .isISO8601()
        .withMessage('Start date must be a valid ISO-8601 date'),
    body('fechaFin')
        .isISO8601()
        .withMessage('End date must be a valid ISO-8601 date'),
    body('comentarios')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comentarios must be at most 500 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getFollowUps(req, res, next) {
    try {
        const followUps = await followUpService.getFollowUps();

        res.status(200).json({
            ok: true,
            count: followUps.length,
            data: followUps
        });
    } catch (error) {
        next(error);
    }
}

async function getFollowUpById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const followUp = await followUpService.getFollowUpById(req.params.idSeguimiento);

        res.status(200).json({
            ok: true,
            data: followUp
        });
    } catch (error) {
        next(error);
    }
}

async function createFollowUp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const followUp = await followUpService.createFollowUp(req.body);

        res.status(201).json({
            ok: true,
            message: 'Follow-up created successfully',
            data: followUp
        });
    } catch (error) {
        next(error);
    }
}

async function updateFollowUp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const followUp = await followUpService.updateFollowUp(
            req.params.idSeguimiento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Follow-up updated successfully',
            data: followUp
        });
    } catch (error) {
        next(error);
    }
}

async function deleteFollowUp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await followUpService.deleteFollowUp(req.params.idSeguimiento);

        res.status(200).json({
            ok: true,
            message: 'Follow-up deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    followUpIdValidation,
    createFollowUpValidation,
    updateFollowUpValidation
};
