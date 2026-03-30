const { body, validationResult } = require('express-validator');
const storeCheckoutService = require('../services/storeCheckoutService');

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

const createOrderValidation = [
    body('total')
        .isFloat({ gt: 0 })
        .withMessage('Total must be greater than 0')
];

const captureOrderValidation = [
    body('orderId')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Order ID is required'),
    body('items')
        .isArray({ min: 1 })
        .withMessage('Items must be a non-empty array'),
    body('items.*.idProducto')
        .isInt({ min: 1 })
        .withMessage('Each item must have a valid idProducto'),
    body('items.*.cantidad')
        .isInt({ min: 1 })
        .withMessage('Each item must have a valid cantidad')
];

async function createOrder(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const orderId = await storeCheckoutService.createOrder(req.body.total);

        res.status(201).json({
            ok: true,
            data: { orderId }
        });
    } catch (error) {
        next(error);
    }
}

async function captureOrder(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const { orderId, items } = req.body;

        const result = await storeCheckoutService.captureAndRecord({
            orderId,
            items,
            identificacion: req.user.identificacion
        });

        res.status(201).json({
            ok: true,
            message: 'Compra registrada exitosamente',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function downloadInvoice(req, res, next) {
    try {
        const { pdfBase64 } = req.body;

        if (!pdfBase64) {
            return res.status(400).json({ ok: false, message: 'PDF data is required' });
        }

        const buffer = Buffer.from(pdfBase64, 'base64');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="factura.pdf"`);
        res.send(buffer);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOrder,
    createOrderValidation,
    captureOrder,
    captureOrderValidation,
    downloadInvoice
};
