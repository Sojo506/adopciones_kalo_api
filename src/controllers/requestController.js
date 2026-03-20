const { body, param, validationResult } = require('express-validator');
const requestService = require('../services/requestService');

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

const requestIdValidation = [
    param('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number')
];

const requestValidation = [
    body('identificacion')
        .trim()
        .matches(/^\d{1,20}$/)
        .withMessage('Identificacion is required and must contain only digits'),
    body('idTipoSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Solicitud must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getRequests(req, res, next) {
    try {
        const requests = await requestService.getRequests();

        res.status(200).json({
            ok: true,
            count: requests.length,
            data: requests
        });
    } catch (error) {
        next(error);
    }
}

async function getRequestById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const request = await requestService.getRequestById(req.params.idSolicitud);

        res.status(200).json({
            ok: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
}

async function createRequest(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const request = await requestService.createRequest(req.body);

        res.status(201).json({
            ok: true,
            message: 'Request created successfully',
            data: request
        });
    } catch (error) {
        next(error);
    }
}

async function updateRequest(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const request = await requestService.updateRequest(
            req.params.idSolicitud,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Request updated successfully',
            data: request
        });
    } catch (error) {
        next(error);
    }
}

async function deleteRequest(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await requestService.deleteRequest(req.params.idSolicitud);

        res.status(200).json({
            ok: true,
            message: 'Request deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRequests,
    getRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
    requestIdValidation,
    requestValidation
};
