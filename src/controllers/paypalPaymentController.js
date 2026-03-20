const { body, param, validationResult } = require('express-validator');
const paypalPaymentService = require('../services/paypalPaymentService');

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

const paypalPaymentIdValidation = [
    param('idPago').isInt({ min: 1 }).withMessage('ID Pago must be a positive number')
];

const createPayPalPaymentValidation = [
    body('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters'),
    body('paypalOrderId')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('PayPal Order ID must be at most 100 characters'),
    body('paypalCaptureId')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('PayPal Capture ID must be at most 100 characters'),
    body('fechaPago').isISO8601().withMessage('Payment date must be a valid ISO-8601 date'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updatePayPalPaymentValidation = [
    body('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters'),
    body('paypalOrderId')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('PayPal Order ID must be at most 100 characters'),
    body('paypalCaptureId')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 100 })
        .withMessage('PayPal Capture ID must be at most 100 characters'),
    body('fechaPago').isISO8601().withMessage('Payment date must be a valid ISO-8601 date'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getPayPalPayments(req, res, next) {
    try {
        const paypalPayments = await paypalPaymentService.getPayPalPayments();

        res.status(200).json({
            ok: true,
            count: paypalPayments.length,
            data: paypalPayments
        });
    } catch (error) {
        next(error);
    }
}

async function getPayPalPaymentById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const paypalPayment = await paypalPaymentService.getPayPalPaymentById(req.params.idPago);

        res.status(200).json({
            ok: true,
            data: paypalPayment
        });
    } catch (error) {
        next(error);
    }
}

async function createPayPalPayment(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const paypalPayment = await paypalPaymentService.createPayPalPayment(req.body);

        res.status(201).json({
            ok: true,
            message: 'PayPal payment created successfully',
            data: paypalPayment
        });
    } catch (error) {
        next(error);
    }
}

async function updatePayPalPayment(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const paypalPayment = await paypalPaymentService.updatePayPalPayment(
            req.params.idPago,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'PayPal payment updated successfully',
            data: paypalPayment
        });
    } catch (error) {
        next(error);
    }
}

async function deletePayPalPayment(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await paypalPaymentService.deletePayPalPayment(req.params.idPago);

        res.status(200).json({
            ok: true,
            message: 'PayPal payment deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getPayPalPayments,
    getPayPalPaymentById,
    createPayPalPayment,
    updatePayPalPayment,
    deletePayPalPayment,
    paypalPaymentIdValidation,
    createPayPalPaymentValidation,
    updatePayPalPaymentValidation
};
