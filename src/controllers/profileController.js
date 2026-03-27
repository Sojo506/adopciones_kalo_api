const { body, validationResult } = require('express-validator');
const profileService = require('../services/profileService');

const PHONE_PATTERN = /^[0-9()+\s-]{6,20}$/;

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

const updateCurrentProfileValidation = [
    body().custom((value, { req }) => {
        if (Object.prototype.hasOwnProperty.call(req.body || {}, 'correo')) {
            throw new Error('Correo must be updated through the verification flow');
        }

        if (Object.prototype.hasOwnProperty.call(req.body || {}, 'password')) {
            throw new Error('Password must be updated through the verification flow');
        }

        return true;
    }),
    body('usuario').trim().isLength({ min: 1 }).withMessage('Usuario is required'),
    body('nombre').trim().isLength({ min: 1 }).withMessage('Nombre is required'),
    body('apellidoPaterno')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Apellido Paterno is required'),
    body('apellidoMaterno')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Apellido Materno is required'),
    body('telefono')
        .trim()
        .matches(PHONE_PATTERN)
        .withMessage('Valid phone is required'),
    body('idPais').isNumeric().withMessage('ID Pais must be a number'),
    body('idProvincia').isNumeric().withMessage('ID Provincia must be a number'),
    body('idCanton').isNumeric().withMessage('ID Canton must be a number'),
    body('idDistrito').isNumeric().withMessage('ID Distrito must be a number'),
    body('calle')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 })
        .withMessage('Calle must be at most 100 characters'),
    body('numero')
        .optional({ values: 'falsy' })
        .isLength({ max: 100 })
        .withMessage('Numero must be at most 100 characters')
];

const requestCurrentEmailChangeValidation = [
    body('nuevoCorreo').trim().isEmail().withMessage('Valid email is required')
];

const confirmCurrentEmailChangeValidation = [
    body('nuevoCorreo').trim().isEmail().withMessage('Valid email is required'),
    body('codigo')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Codigo must contain 6 digits')
        .isNumeric()
        .withMessage('Codigo must contain only digits')
];

const requestCurrentPasswordChangeValidation = [
    body('currentPassword')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
];

const confirmCurrentPasswordChangeValidation = [
    body('currentPassword')
        .trim()
        .isLength({ min: 1 })
        .withMessage('Current password is required'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters'),
    body('codigo')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Codigo must contain 6 digits')
        .isNumeric()
        .withMessage('Codigo must contain only digits')
];

async function getCurrentProfile(req, res, next) {
    try {
        const profileOverview = await profileService.getCurrentProfileOverview(req.user.idCuenta);

        res.status(200).json({
            ok: true,
            data: profileOverview
        });
    } catch (error) {
        next(error);
    }
}

async function updateCurrentProfile(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const profileOverview = await profileService.updateCurrentProfile(
            req.user.idCuenta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Profile updated successfully',
            data: profileOverview
        });
    } catch (error) {
        next(error);
    }
}

async function requestCurrentEmailChange(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const result = await profileService.requestCurrentEmailChange(req.user.idCuenta, req.body);

        res.status(200).json({
            ok: true,
            message: 'A verification code has been sent to the new email address',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function confirmCurrentEmailChange(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const profileOverview = await profileService.confirmCurrentEmailChange(
            req.user.idCuenta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Email updated successfully',
            data: profileOverview
        });
    } catch (error) {
        next(error);
    }
}

async function requestCurrentPasswordChange(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const result = await profileService.requestCurrentPasswordChange(
            req.user.idCuenta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'A verification code has been sent to your email',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function confirmCurrentPasswordChange(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const result = await profileService.confirmCurrentPasswordChange(
            req.user.idCuenta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Password updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCurrentProfile,
    updateCurrentProfile,
    updateCurrentProfileValidation,
    requestCurrentEmailChange,
    requestCurrentEmailChangeValidation,
    confirmCurrentEmailChange,
    confirmCurrentEmailChangeValidation,
    requestCurrentPasswordChange,
    requestCurrentPasswordChangeValidation,
    confirmCurrentPasswordChange,
    confirmCurrentPasswordChangeValidation
};
