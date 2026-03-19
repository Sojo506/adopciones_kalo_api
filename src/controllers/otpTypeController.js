const { body, param, validationResult } = require('express-validator');
const otpTypeService = require('../services/otpTypeService');

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

const otpTypeIdValidation = [
    param('idTipoOtp').isInt({ min: 1 }).withMessage('ID Tipo OTP must be a positive number')
];

const otpTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getOtpTypes(req, res, next) {
    try {
        const otpTypes = await otpTypeService.getOtpTypes();

        res.status(200).json({
            ok: true,
            count: otpTypes.length,
            data: otpTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getOtpTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otpType = await otpTypeService.getOtpTypeById(req.params.idTipoOtp);

        res.status(200).json({
            ok: true,
            data: otpType
        });
    } catch (error) {
        next(error);
    }
}

async function createOtpType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otpType = await otpTypeService.createOtpType(req.body);

        res.status(201).json({
            ok: true,
            message: 'OTP type created successfully',
            data: otpType
        });
    } catch (error) {
        next(error);
    }
}

async function updateOtpType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const otpType = await otpTypeService.updateOtpType(req.params.idTipoOtp, req.body);

        res.status(200).json({
            ok: true,
            message: 'OTP type updated successfully',
            data: otpType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteOtpType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await otpTypeService.deleteOtpType(req.params.idTipoOtp);

        res.status(200).json({
            ok: true,
            message: 'OTP type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getOtpTypes,
    getOtpTypeById,
    createOtpType,
    updateOtpType,
    deleteOtpType,
    otpTypeIdValidation,
    otpTypeValidation
};
