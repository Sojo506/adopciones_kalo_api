const { body, param, validationResult } = require('express-validator');
const saleService = require('../services/saleService');

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

const saleIdValidation = [
    param('idVenta').isInt({ min: 1 }).withMessage('ID Venta must be a positive number')
];

const saleValidation = [
    body('identificacion')
        .isInt({ min: 1 })
        .withMessage('Identificacion must be a positive number'),
    body('fechaVenta')
        .isISO8601()
        .withMessage('Fecha Venta must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getSales(req, res, next) {
    try {
        const sales = await saleService.getSales();

        res.status(200).json({
            ok: true,
            count: sales.length,
            data: sales
        });
    } catch (error) {
        next(error);
    }
}

async function getSaleById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sale = await saleService.getSaleById(req.params.idVenta);

        res.status(200).json({
            ok: true,
            data: sale
        });
    } catch (error) {
        next(error);
    }
}

async function createSale(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sale = await saleService.createSale(req.body);

        res.status(201).json({
            ok: true,
            message: 'Sale created successfully',
            data: sale
        });
    } catch (error) {
        next(error);
    }
}

async function updateSale(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sale = await saleService.updateSale(req.params.idVenta, req.body);

        res.status(200).json({
            ok: true,
            message: 'Sale updated successfully',
            data: sale
        });
    } catch (error) {
        next(error);
    }
}

async function deleteSale(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await saleService.deleteSale(req.params.idVenta);

        res.status(200).json({
            ok: true,
            message: 'Sale deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    saleIdValidation,
    saleValidation
};
