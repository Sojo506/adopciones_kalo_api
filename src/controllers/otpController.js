const { body, param, validationResult } = require('express-validator');
const otpService = require('../services/otpService');

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

const otpIdValidation = [
    param('idCodigoOtp').isInt({ min: 1 }).withMessage('ID Codigo OTP must be a positive number')
];

const otpBodyValidation = [
    body('idCuenta').isInt({ min: 1 }).withMessage('ID Cuenta must be a positive number'),
    body('idTipoOtp').isInt({ min: 1 }).withMessage('ID Tipo OTP must be a positive number'),
    body('codigoHash')
        .trim()
        .isLength({ min: 1, max: 200 })
        .withMessage('Codigo hash is required and must be at most 200 characters'),
    body('fechaExpiracion').isISO8601().withMessage('Expiration date must be a valid ISO-8601 date'),
    body('fechaUso')
        .optional({ values: 'falsy' })
        .isISO8601()
        .withMessage('Usage date must be a valid ISO-8601 date'),
    body('intentos').isInt({ min: 0 }).withMessage('Intentos must be zero or greater'),
    body('fechaCreacion').isISO8601().withMessage('Creation date must be a valid ISO-8601 date'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getOtps(req, res, next) {
    try {
        const otps = await otpService.getOtps();

        res.status(200).json({
            ok: true,
            count: otps.length,
            data: otps
        });
    } catch (error) {
        next(error);
    }
}

async function getOtpById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otp = await otpService.getOtpById(req.params.idCodigoOtp);

        res.status(200).json({
            ok: true,
            data: otp
        });
    } catch (error) {
        next(error);
    }
}

async function createOtp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otp = await otpService.createOtp(req.body);

        res.status(201).json({
            ok: true,
            message: 'OTP created successfully',
            data: otp
        });
    } catch (error) {
        next(error);
    }
}

async function updateOtp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otp = await otpService.updateOtp(req.params.idCodigoOtp, req.body);

        res.status(200).json({
            ok: true,
            message: 'OTP updated successfully',
            data: otp
        });
    } catch (error) {
        next(error);
    }
}

async function deleteOtp(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await otpService.deleteOtp(req.params.idCodigoOtp);

        res.status(200).json({
            ok: true,
            message: 'OTP deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getOtps,
    getOtpById,
    createOtp,
    updateOtp,
    deleteOtp,
    otpIdValidation,
    otpBodyValidation
};
