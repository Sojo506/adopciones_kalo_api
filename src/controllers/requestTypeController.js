const { body, param, validationResult } = require('express-validator');
const requestTypeService = require('../services/requestTypeService');

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

const requestTypeIdValidation = [
    param('idTipoSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Solicitud must be a positive number')
];

const requestTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getRequestTypes(req, res, next) {
    try {
        const requestTypes = await requestTypeService.getRequestTypes();

        res.status(200).json({
            ok: true,
            count: requestTypes.length,
            data: requestTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getRequestTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestType = await requestTypeService.getRequestTypeById(
            req.params.idTipoSolicitud
        );

        res.status(200).json({
            ok: true,
            data: requestType
        });
    } catch (error) {
        next(error);
    }
}

async function createRequestType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestType = await requestTypeService.createRequestType(req.body);

        res.status(201).json({
            ok: true,
            message: 'Request type created successfully',
            data: requestType
        });
    } catch (error) {
        next(error);
    }
}

async function updateRequestType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestType = await requestTypeService.updateRequestType(
            req.params.idTipoSolicitud,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Request type updated successfully',
            data: requestType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteRequestType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await requestTypeService.deleteRequestType(req.params.idTipoSolicitud);

        res.status(200).json({
            ok: true,
            message: 'Request type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRequestTypes,
    getRequestTypeById,
    createRequestType,
    updateRequestType,
    deleteRequestType,
    requestTypeIdValidation,
    requestTypeValidation
};
