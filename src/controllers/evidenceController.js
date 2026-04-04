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

function isAdminRequest(req) {
    return Number(req.authenticatedAccount?.ID_TIPO_USUARIO) === 1;
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

const evidenceContentValidation = () =>
    body().custom((_, { req }) => {
        const comentarios = String(req.body?.comentarios || '').trim();
        const hasImageFile = Boolean(req.file?.buffer);

        if (isAdminRequest(req)) {
            if (!comentarios && !hasImageFile) {
                throw new Error('An evidence must include comments or an image');
            }

            return true;
        }

        if (!hasImageFile) {
            throw new Error('An image is required for the public follow-up form');
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
    body('fechaEvidencia')
        .isISO8601()
        .withMessage('Evidence date must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number'),
    body('clearImage')
        .optional({ values: 'falsy' })
        .isIn(['true', 'false', '1', '0', 'yes', 'no', 'on', 'off'])
        .withMessage('clearImage must be a boolean-like value')
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
            req.file,
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
            req.file,
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
