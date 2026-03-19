const { body, param, validationResult } = require('express-validator');
const responseTypeService = require('../services/responseTypeService');

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

const responseTypeIdValidation = [
    param('idTipoRespuesta')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Respuesta must be a positive number')
];

const responseTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getResponseTypes(req, res, next) {
    try {
        const responseTypes = await responseTypeService.getResponseTypes();

        res.status(200).json({
            ok: true,
            count: responseTypes.length,
            data: responseTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getResponseTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const responseType = await responseTypeService.getResponseTypeById(
            req.params.idTipoRespuesta
        );

        res.status(200).json({
            ok: true,
            data: responseType
        });
    } catch (error) {
        next(error);
    }
}

async function createResponseType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const responseType = await responseTypeService.createResponseType(req.body);

        res.status(201).json({
            ok: true,
            message: 'Response type created successfully',
            data: responseType
        });
    } catch (error) {
        next(error);
    }
}

async function updateResponseType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const responseType = await responseTypeService.updateResponseType(
            req.params.idTipoRespuesta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Response type updated successfully',
            data: responseType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteResponseType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await responseTypeService.deleteResponseType(req.params.idTipoRespuesta);

        res.status(200).json({
            ok: true,
            message: 'Response type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getResponseTypes,
    getResponseTypeById,
    createResponseType,
    updateResponseType,
    deleteResponseType,
    responseTypeIdValidation,
    responseTypeValidation
};
