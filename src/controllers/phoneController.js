const { body, param, validationResult } = require('express-validator');
const phoneService = require('../services/phoneService');

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

const phoneKeyValidation = [
    param('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    param('telefono').trim().matches(PHONE_PATTERN).withMessage('Valid phone is required')
];

const createPhoneValidation = [
    body('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    body('telefono').trim().matches(PHONE_PATTERN).withMessage('Valid phone is required'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

const updatePhoneValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getPhones(req, res, next) {
    try {
        const phones = await phoneService.getPhones();

        res.status(200).json({
            ok: true,
            count: phones.length,
            data: phones
        });
    } catch (error) {
        next(error);
    }
}

async function getPhoneByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const phone = await phoneService.getPhoneByPk(
            req.params.identificacion,
            req.params.telefono
        );

        res.status(200).json({
            ok: true,
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

async function createPhone(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const phone = await phoneService.createPhone(req.body);

        res.status(201).json({
            ok: true,
            message: 'Phone created successfully',
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

async function updatePhone(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const phone = await phoneService.updatePhone(
            req.params.identificacion,
            req.params.telefono,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Phone updated successfully',
            data: phone
        });
    } catch (error) {
        next(error);
    }
}

async function deletePhone(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await phoneService.deletePhone(req.params.identificacion, req.params.telefono);

        res.status(200).json({
            ok: true,
            message: 'Phone deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPhones,
    getPhoneByPk,
    createPhone,
    updatePhone,
    deletePhone,
    phoneKeyValidation,
    createPhoneValidation,
    updatePhoneValidation
};
