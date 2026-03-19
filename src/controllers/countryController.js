const { body, param, validationResult } = require('express-validator');
const countryService = require('../services/countryService');

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

const countryIdValidation = [
    param('idPais').isInt({ min: 1 }).withMessage('ID Pais must be a positive number')
];

const countryBodyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getCountries(req, res, next) {
    try {
        const countries = await countryService.getCountries();

        res.status(200).json({
            ok: true,
            count: countries.length,
            data: countries
        });
    } catch (error) {
        next(error);
    }
}

async function getCountryById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const country = await countryService.getCountryById(req.params.idPais);

        res.status(200).json({
            ok: true,
            data: country
        });
    } catch (error) {
        next(error);
    }
}

async function createCountry(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const country = await countryService.createCountry(req.body);

        res.status(201).json({
            ok: true,
            message: 'Country created successfully',
            data: country
        });
    } catch (error) {
        next(error);
    }
}

async function updateCountry(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const country = await countryService.updateCountry(req.params.idPais, req.body);

        res.status(200).json({
            ok: true,
            message: 'Country updated successfully',
            data: country
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCountry(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await countryService.deleteCountry(req.params.idPais);

        res.status(200).json({
            ok: true,
            message: 'Country deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCountries,
    getCountryById,
    createCountry,
    updateCountry,
    deleteCountry,
    countryIdValidation,
    countryBodyValidation
};
