const { body, param, validationResult } = require('express-validator');
const saleInvoiceService = require('../services/saleInvoiceService');

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

const saleInvoiceKeyValidation = [
    param('idVenta').isInt({ min: 1 }).withMessage('ID Venta must be a positive number'),
    param('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters')
];

const createSaleInvoiceValidation = [
    body('idVenta').isInt({ min: 1 }).withMessage('ID Venta must be a positive number'),
    body('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateSaleInvoiceValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getSaleInvoices(req, res, next) {
    try {
        const saleInvoices = await saleInvoiceService.getSaleInvoices();

        res.status(200).json({
            ok: true,
            count: saleInvoices.length,
            data: saleInvoices
        });
    } catch (error) {
        next(error);
    }
}

async function getSaleInvoiceByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleInvoice = await saleInvoiceService.getSaleInvoiceByPk(
            req.params.idVenta,
            req.params.idFactura
        );

        res.status(200).json({
            ok: true,
            data: saleInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function createSaleInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleInvoice = await saleInvoiceService.createSaleInvoice(req.body);

        res.status(201).json({
            ok: true,
            message: 'Sale-invoice relation created successfully',
            data: saleInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function updateSaleInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleInvoice = await saleInvoiceService.updateSaleInvoice(
            req.params.idVenta,
            req.params.idFactura,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Sale-invoice relation updated successfully',
            data: saleInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function deleteSaleInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await saleInvoiceService.deleteSaleInvoice(req.params.idVenta, req.params.idFactura);

        res.status(200).json({
            ok: true,
            message: 'Sale-invoice relation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSaleInvoices,
    getSaleInvoiceByPk,
    createSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice,
    saleInvoiceKeyValidation,
    createSaleInvoiceValidation,
    updateSaleInvoiceValidation
};
