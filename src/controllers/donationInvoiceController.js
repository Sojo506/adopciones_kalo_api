const { body, param, validationResult } = require('express-validator');
const donationInvoiceService = require('../services/donationInvoiceService');

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

const donationInvoiceKeyValidation = [
    param('idDonacion').isInt({ min: 1 }).withMessage('ID Donacion must be a positive number'),
    param('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters')
];

const createDonationInvoiceValidation = [
    body('idDonacion').isInt({ min: 1 }).withMessage('ID Donacion must be a positive number'),
    body('idFactura')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('ID Factura is required and must be at most 100 characters'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateDonationInvoiceValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getDonationInvoices(req, res, next) {
    try {
        const donationInvoices = await donationInvoiceService.getDonationInvoices();

        res.status(200).json({
            ok: true,
            count: donationInvoices.length,
            data: donationInvoices
        });
    } catch (error) {
        next(error);
    }
}

async function getDonationInvoiceByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donationInvoice = await donationInvoiceService.getDonationInvoiceByPk(
            req.params.idDonacion,
            req.params.idFactura
        );

        res.status(200).json({
            ok: true,
            data: donationInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function createDonationInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donationInvoice = await donationInvoiceService.createDonationInvoice(req.body);

        res.status(201).json({
            ok: true,
            message: 'Donation-invoice relation created successfully',
            data: donationInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function updateDonationInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donationInvoice = await donationInvoiceService.updateDonationInvoice(
            req.params.idDonacion,
            req.params.idFactura,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Donation-invoice relation updated successfully',
            data: donationInvoice
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDonationInvoice(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await donationInvoiceService.deleteDonationInvoice(
            req.params.idDonacion,
            req.params.idFactura
        );

        res.status(200).json({
            ok: true,
            message: 'Donation-invoice relation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDonationInvoices,
    getDonationInvoiceByPk,
    createDonationInvoice,
    updateDonationInvoice,
    deleteDonationInvoice,
    donationInvoiceKeyValidation,
    createDonationInvoiceValidation,
    updateDonationInvoiceValidation
};
