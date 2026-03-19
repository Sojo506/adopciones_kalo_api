const { body, param, validationResult } = require('express-validator');
const currencyService = require('../services/currencyService');

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

const currencyIdValidation = [
    param('idMoneda').isInt({ min: 1 }).withMessage('ID Moneda must be a positive number')
];

const currencyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('simbolo')
        .trim()
        .isLength({ min: 1, max: 10 })
        .withMessage('Simbolo is required and must be at most 10 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getCurrencies(req, res, next) {
    try {
        const currencies = await currencyService.getCurrencies();

        res.status(200).json({
            ok: true,
            count: currencies.length,
            data: currencies
        });
    } catch (error) {
        next(error);
    }
}

async function getCurrencyById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const currency = await currencyService.getCurrencyById(req.params.idMoneda);

        res.status(200).json({
            ok: true,
            data: currency
        });
    } catch (error) {
        next(error);
    }
}

async function createCurrency(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const currency = await currencyService.createCurrency(req.body);

        res.status(201).json({
            ok: true,
            message: 'Currency created successfully',
            data: currency
        });
    } catch (error) {
        next(error);
    }
}

async function updateCurrency(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const currency = await currencyService.updateCurrency(req.params.idMoneda, req.body);

        res.status(200).json({
            ok: true,
            message: 'Currency updated successfully',
            data: currency
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCurrency(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await currencyService.deleteCurrency(req.params.idMoneda);

        res.status(200).json({
            ok: true,
            message: 'Currency deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCurrencies,
    getCurrencyById,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    currencyIdValidation,
    currencyValidation
};
