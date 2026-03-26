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
    body('password')
        .optional({ values: 'falsy' })
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters'),
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

module.exports = {
    getCurrentProfile,
    updateCurrentProfile,
    updateCurrentProfileValidation
};
