const { body, param, validationResult } = require('express-validator');
const addressService = require('../services/addressService');

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

const addressIdValidation = [
    param('idDireccion').isInt({ min: 1 }).withMessage('ID Direccion must be a positive number')
];

const addressBodyValidation = [
    body('idDistrito').isInt({ min: 1 }).withMessage('ID Distrito must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number'),
    body('calle')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Calle must be at most 100 characters'),
    body('numero')
        .optional({ nullable: true })
        .trim()
        .isLength({ max: 100 })
        .withMessage('Numero must be at most 100 characters')
];

async function getAddresses(req, res, next) {
    try {
        const addresses = await addressService.getAddresses();

        res.status(200).json({
            ok: true,
            count: addresses.length,
            data: addresses
        });
    } catch (error) {
        next(error);
    }
}

async function getAddressById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const address = await addressService.getAddressById(req.params.idDireccion);

        res.status(200).json({
            ok: true,
            data: address
        });
    } catch (error) {
        next(error);
    }
}

async function createAddress(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const address = await addressService.createAddress(req.body);

        res.status(201).json({
            ok: true,
            message: 'Address created successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
}

async function updateAddress(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const address = await addressService.updateAddress(req.params.idDireccion, req.body);

        res.status(200).json({
            ok: true,
            message: 'Address updated successfully',
            data: address
        });
    } catch (error) {
        next(error);
    }
}

async function deleteAddress(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await addressService.deleteAddress(req.params.idDireccion);

        res.status(200).json({
            ok: true,
            message: 'Address deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    addressIdValidation,
    addressBodyValidation
};
