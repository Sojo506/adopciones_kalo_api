const { body, query, validationResult } = require('express-validator');
const adoptionRequestService = require('../services/adoptionRequestService');

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

const submitAdoptionRequestValidation = [
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('respuestas')
        .isArray({ min: 1 })
        .withMessage('Respuestas must be a non-empty array'),
    body('respuestas.*.idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number'),
    body('respuestas.*.respuesta')
        .custom((value) => {
            if (value === undefined || value === null) {
                return false;
            }

            return String(value).trim().length > 0;
        })
        .withMessage('Respuesta is required')
];

async function submitAdoptionRequest(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const request = await adoptionRequestService.createAdoptionRequest({
            identificacion: req.user.identificacion,
            idPerrito: req.body.idPerrito,
            respuestas: req.body.respuestas
        });

        res.status(201).json({
            ok: true,
            message: 'Adoption request submitted successfully',
            data: request
        });
    } catch (error) {
        next(error);
    }
}

const checkPendingAdoptionValidation = [
    query('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number')
];

async function checkPendingAdoption(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const hasPending = await adoptionRequestService.hasPendingAdoptionForDog(
            req.user.identificacion,
            req.query.idPerrito
        );

        res.json({ ok: true, hasPending });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    submitAdoptionRequest,
    submitAdoptionRequestValidation,
    checkPendingAdoption,
    checkPendingAdoptionValidation
};
