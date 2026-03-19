const { body, param, validationResult } = require('express-validator');
const trackingTypeService = require('../services/trackingTypeService');

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

const trackingTypeIdValidation = [
    param('idTipoSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Seguimiento must be a positive number')
];

const trackingTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getTrackingTypes(req, res, next) {
    try {
        const trackingTypes = await trackingTypeService.getTrackingTypes();

        res.status(200).json({
            ok: true,
            count: trackingTypes.length,
            data: trackingTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getTrackingTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const trackingType = await trackingTypeService.getTrackingTypeById(
            req.params.idTipoSeguimiento
        );

        res.status(200).json({
            ok: true,
            data: trackingType
        });
    } catch (error) {
        next(error);
    }
}

async function createTrackingType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const trackingType = await trackingTypeService.createTrackingType(req.body);

        res.status(201).json({
            ok: true,
            message: 'Tracking type created successfully',
            data: trackingType
        });
    } catch (error) {
        next(error);
    }
}

async function updateTrackingType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const trackingType = await trackingTypeService.updateTrackingType(
            req.params.idTipoSeguimiento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Tracking type updated successfully',
            data: trackingType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteTrackingType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await trackingTypeService.deleteTrackingType(req.params.idTipoSeguimiento);

        res.status(200).json({
            ok: true,
            message: 'Tracking type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getTrackingTypes,
    getTrackingTypeById,
    createTrackingType,
    updateTrackingType,
    deleteTrackingType,
    trackingTypeIdValidation,
    trackingTypeValidation
};
