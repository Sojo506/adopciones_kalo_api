const { body, param, validationResult } = require('express-validator');
const donationService = require('../services/donationService');

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

const donationIdValidation = [
    param('idDonacion')
        .isInt({ min: 1 })
        .withMessage('ID Donacion must be a positive number')
];

const donationValidation = [
    body('identificacion')
        .isInt({ min: 1 })
        .withMessage('Identificacion must be a positive number'),
    body('idCampania')
        .isInt({ min: 1 })
        .withMessage('ID Campania must be a positive number'),
    body('monto')
        .isFloat({ gt: 0 })
        .withMessage('Monto must be greater than 0'),
    body('fechaDonacion')
        .isISO8601()
        .withMessage('Fecha Donacion must be a valid ISO-8601 date'),
    body('mensaje')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Mensaje must be at most 500 characters'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getDonations(req, res, next) {
    try {
        const donations = await donationService.getDonations();

        res.status(200).json({
            ok: true,
            count: donations.length,
            data: donations
        });
    } catch (error) {
        next(error);
    }
}

async function getDonationById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donation = await donationService.getDonationById(req.params.idDonacion);

        res.status(200).json({
            ok: true,
            data: donation
        });
    } catch (error) {
        next(error);
    }
}

async function createDonation(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donation = await donationService.createDonation(req.body);

        res.status(201).json({
            ok: true,
            message: 'Donation created successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
}

async function updateDonation(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const donation = await donationService.updateDonation(req.params.idDonacion, req.body);

        res.status(200).json({
            ok: true,
            message: 'Donation updated successfully',
            data: donation
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDonation(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await donationService.deleteDonation(req.params.idDonacion);

        res.status(200).json({
            ok: true,
            message: 'Donation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDonations,
    getDonationById,
    createDonation,
    updateDonation,
    deleteDonation,
    donationIdValidation,
    donationValidation
};
