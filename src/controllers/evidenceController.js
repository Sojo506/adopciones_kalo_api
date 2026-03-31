const { body, param, validationResult } = require('express-validator');
const evidenceService = require('../services/evidenceService');

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

const evidenceIdValidation = [
    param('idEvidencia')
        .isInt({ min: 1 })
        .withMessage('ID Evidencia must be a positive number')
];

const followUpIdValidation = [
    param('idSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Seguimiento must be a positive number')
];

const imageUrlValidation = () =>
    body('imageUrl')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Image URL must be at most 500 characters')
        .bail()
        .isURL({
            protocols: ['http', 'https'],
            require_protocol: true
        })
        .withMessage('Image URL must be a valid http or https URL');

const evidenceContentValidation = () =>
    body().custom((_, { req }) => {
        const comentarios = String(req.body?.comentarios || '').trim();
        const imageUrl = String(req.body?.imageUrl || '').trim();

        if (!comentarios && !imageUrl) {
            throw new Error('An evidence must include comments or an image URL');
        }

        return true;
    });

const createEvidenceValidation = [
    body('idSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Seguimiento must be a positive number'),
    body('comentarios')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comentarios must be at most 500 characters'),
    imageUrlValidation(),
    body('fechaEvidencia')
        .isISO8601()
        .withMessage('Evidence date must be a valid ISO-8601 date'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number'),
    evidenceContentValidation()
];

const updateEvidenceValidation = [
    body('idSeguimiento')
        .isInt({ min: 1 })
        .withMessage('ID Seguimiento must be a positive number'),
    body('comentarios')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Comentarios must be at most 500 characters'),
    imageUrlValidation(),
    body('fechaEvidencia')
        .isISO8601()
        .withMessage('Evidence date must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number'),
    evidenceContentValidation()
];

async function getEvidences(req, res, next) {
    try {
        const evidences = await evidenceService.getEvidences(req.user.idCuenta);

        res.status(200).json({
            ok: true,
            count: evidences.length,
            data: evidences
        });
    } catch (error) {
        next(error);
    }
}

async function getEvidencesByFollowUp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const evidences = await evidenceService.getEvidencesByFollowUp(
            req.params.idSeguimiento,
            req.user.idCuenta
        );

        res.status(200).json({
            ok: true,
            count: evidences.length,
            data: evidences
        });
    } catch (error) {
        next(error);
    }
}

async function getEvidenceById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const evidence = await evidenceService.getEvidenceById(
            req.params.idEvidencia,
            req.user.idCuenta
        );

        res.status(200).json({
            ok: true,
            data: evidence
        });
    } catch (error) {
        next(error);
    }
}

async function createEvidence(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const evidence = await evidenceService.createEvidence(
            req.body,
            req.user.idCuenta
        );

        res.status(201).json({
            ok: true,
            message: 'Evidence created successfully',
            data: evidence
        });
    } catch (error) {
        next(error);
    }
}

async function updateEvidence(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const evidence = await evidenceService.updateEvidence(
            req.params.idEvidencia,
            req.body,
            req.user.idCuenta
        );

        res.status(200).json({
            ok: true,
            message: 'Evidence updated successfully',
            data: evidence
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEvidence(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await evidenceService.deleteEvidence(req.params.idEvidencia, req.user.idCuenta);

        res.status(200).json({
            ok: true,
            message: 'Evidence deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEvidences,
    getEvidencesByFollowUp,
    getEvidenceById,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    evidenceIdValidation,
    followUpIdValidation,
    createEvidenceValidation,
    updateEvidenceValidation
};
