const { body, validationResult } = require('express-validator');
const paypalCheckoutService = require('../services/paypalCheckoutService');

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
    body('idCampania')
        .isInt({ min: 1 })
        .withMessage('ID Campania must be a positive number'),
    body('monto')
        .isFloat({ gt: 0 })
        .withMessage('Monto must be greater than 0')
];

const captureOrderValidation = [
    body('orderId')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Order ID is required'),
    body('idCampania')
        .isInt({ min: 1 })
        .withMessage('ID Campania must be a positive number'),
    body('monto')
        .isFloat({ gt: 0 })
        .withMessage('Monto must be greater than 0'),
    body('mensaje')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Mensaje must be at most 500 characters')
];

async function createOrder(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const orderId = await paypalCheckoutService.createOrder(req.body.monto);

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

        const { orderId, idCampania, monto, mensaje } = req.body;

        const donation = await paypalCheckoutService.captureAndRecord({
            orderId,
            idCampania: Number(idCampania),
            monto: Number(monto),
            mensaje: mensaje || null,
            identificacion: req.user.identificacion
        });

        res.status(201).json({
            ok: true,
            message: 'Donacion registrada exitosamente',
            data: donation
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOrder,
    createOrderValidation,
    captureOrder,
    captureOrderValidation
};
