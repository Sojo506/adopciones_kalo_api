const { body, param, validationResult } = require('express-validator');
const responseService = require('../services/responseService');

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

const responseIdValidation = [
    param('idRespuesta')
        .isInt({ min: 1 })
        .withMessage('ID Respuesta must be a positive number')
];

const responseValidation = [
    body('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    body('idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number'),
    body('respuesta')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Respuesta is required and must be at most 500 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getResponses(req, res, next) {
    try {
        const responses = await responseService.getResponses();

        res.status(200).json({
            ok: true,
            count: responses.length,
            data: responses
        });
    } catch (error) {
        next(error);
    }
}

async function getResponseById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const response = await responseService.getResponseById(req.params.idRespuesta);

        res.status(200).json({
            ok: true,
            data: response
        });
    } catch (error) {
        next(error);
    }
}

async function createResponse(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const response = await responseService.createResponse(req.body);

        res.status(201).json({
            ok: true,
            message: 'Response created successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

async function updateResponse(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const response = await responseService.updateResponse(
            req.params.idRespuesta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Response updated successfully',
            data: response
        });
    } catch (error) {
        next(error);
    }
}

async function deleteResponse(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await responseService.deleteResponse(req.params.idRespuesta);

        res.status(200).json({
            ok: true,
            message: 'Response deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getResponses,
    getResponseById,
    createResponse,
    updateResponse,
    deleteResponse,
    responseIdValidation,
    responseValidation
};
