const { body, param, validationResult } = require('express-validator');
const refreshTokenService = require('../services/refreshTokenService');

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

const refreshTokenIdValidation = [
    param('idRefreshToken').isInt({ min: 1 }).withMessage('ID Refresh Token must be a positive number')
];

const refreshTokenBodyValidation = [
    body('idCuenta').isInt({ min: 1 }).withMessage('ID Cuenta must be a positive number'),
    body('tokenHash')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Token hash is required and must be at most 500 characters'),
    body('jti')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('JTI must be at most 100 characters'),
    body('ipAddress')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('IP Address must be at most 100 characters'),
    body('userAgent')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 300 })
        .withMessage('User Agent must be at most 300 characters'),
    body('fechaExpiracion').isISO8601().withMessage('Expiration date must be a valid ISO-8601 date'),
    body('fechaRevocacion')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Revocation date must be a valid ISO-8601 date'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getRefreshTokens(req, res, next) {
    try {
        const refreshTokens = await refreshTokenService.getRefreshTokens();

        res.status(200).json({
            ok: true,
            count: refreshTokens.length,
            data: refreshTokens
        });
    } catch (error) {
        next(error);
    }
}

async function getRefreshTokenById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const refreshToken = await refreshTokenService.getRefreshTokenById(req.params.idRefreshToken);

        res.status(200).json({
            ok: true,
            data: refreshToken
        });
    } catch (error) {
        next(error);
    }
}

async function createRefreshToken(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const refreshToken = await refreshTokenService.createRefreshToken(req.body);

        res.status(201).json({
            ok: true,
            message: 'Refresh token created successfully',
            data: refreshToken
        });
    } catch (error) {
        next(error);
    }
}

async function updateRefreshToken(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const refreshToken = await refreshTokenService.updateRefreshToken(
            req.params.idRefreshToken,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Refresh token updated successfully',
            data: refreshToken
        });
    } catch (error) {
        next(error);
    }
}

async function deleteRefreshToken(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await refreshTokenService.deleteRefreshToken(req.params.idRefreshToken);

        res.status(200).json({
            ok: true,
            message: 'Refresh token deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRefreshTokens,
    getRefreshTokenById,
    createRefreshToken,
    updateRefreshToken,
    deleteRefreshToken,
    refreshTokenIdValidation,
    refreshTokenBodyValidation
};
