const { body, param, validationResult } = require('express-validator');
const adoptionService = require('../services/adoptionService');

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

const adoptionIdValidation = [
    param('idAdopcion')
        .isInt({ min: 1 })
        .withMessage('ID Adopcion must be a positive number')
];

const createAdoptionValidation = [
    body('identificacion')
        .trim()
        .matches(/^\d{1,20}$/)
        .withMessage('Identificacion is required and must contain only digits'),
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    body('fechaAdopcion')
        .isISO8601()
        .withMessage('Adoption date must be a valid ISO-8601 date'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateAdoptionValidation = [
    body('identificacion')
        .trim()
        .matches(/^\d{1,20}$/)
        .withMessage('Identificacion is required and must contain only digits'),
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    body('fechaAdopcion')
        .isISO8601()
        .withMessage('Adoption date must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getAdoptions(req, res, next) {
    try {
        const adoptions = await adoptionService.getAdoptions();

        res.status(200).json({
            ok: true,
            count: adoptions.length,
            data: adoptions
        });
    } catch (error) {
        next(error);
    }
}

async function getAdoptionById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const adoption = await adoptionService.getAdoptionById(req.params.idAdopcion);

        res.status(200).json({
            ok: true,
            data: adoption
        });
    } catch (error) {
        next(error);
    }
}

async function createAdoption(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const adoption = await adoptionService.createAdoption(req.body);

        res.status(201).json({
            ok: true,
            message: 'Adoption created successfully',
            data: adoption
        });
    } catch (error) {
        next(error);
    }
}

async function updateAdoption(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const adoption = await adoptionService.updateAdoption(
            req.params.idAdopcion,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Adoption updated successfully',
            data: adoption
        });
    } catch (error) {
        next(error);
    }
}

async function deleteAdoption(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await adoptionService.deleteAdoption(req.params.idAdopcion);

        res.status(200).json({
            ok: true,
            message: 'Adoption deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAdoptions,
    getAdoptionById,
    createAdoption,
    updateAdoption,
    deleteAdoption,
    adoptionIdValidation,
    createAdoptionValidation,
    updateAdoptionValidation
};
