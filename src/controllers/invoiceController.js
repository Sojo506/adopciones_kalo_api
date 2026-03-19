const { body, param, validationResult } = require('express-validator');
const invoiceService = require('../services/invoiceService');

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

const invoiceIdValidation = [
    param('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters')
];

const invoiceBaseValidation = [
    body('idMoneda').isInt({ min: 1 }).withMessage('ID Moneda must be a positive number'),
    body('tasaImpuestoAplicada')
        .optional({ values: 'falsy' })
        .isFloat({ min: 0, max: 99.9999 })
        .withMessage('Tax rate must be a non-negative number with at most four decimals'),
    body('fechaFactura')
        .isISO8601()
        .withMessage('Fecha Factura must be a valid ISO-8601 date')
];

const invoiceCreateValidation = [
    ...invoiceBaseValidation,
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const invoiceUpdateValidation = [
    ...invoiceBaseValidation,
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getInvoices(req, res, next) {
    try {
        const invoices = await invoiceService.getInvoices();

        res.status(200).json({
            ok: true,
            count: invoices.length,
            data: invoices
        });
    } catch (error) {
        next(error);
    }
}

async function getInvoiceById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const invoice = await invoiceService.getInvoiceById(req.params.idFactura);

        res.status(200).json({
            ok: true,
            data: invoice
        });
    } catch (error) {
        next(error);
    }
}

async function createInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const invoice = await invoiceService.createInvoice(req.body);

        res.status(201).json({
            ok: true,
            message: 'Invoice created successfully',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
}

async function updateInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const invoice = await invoiceService.updateInvoice(req.params.idFactura, req.body);

        res.status(200).json({
            ok: true,
            message: 'Invoice updated successfully',
            data: invoice
        });
    } catch (error) {
        next(error);
    }
}

async function deleteInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await invoiceService.deleteInvoice(req.params.idFactura);

        res.status(200).json({
            ok: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    invoiceIdValidation,
    invoiceCreateValidation,
    invoiceUpdateValidation
};
