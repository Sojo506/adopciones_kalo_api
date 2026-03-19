const { body, param, validationResult } = require('express-validator');
const emailService = require('../services/emailService');

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

const emailKeyValidation = [
    param('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    param('correo').trim().isEmail().withMessage('Valid email is required')
];

const createEmailValidation = [
    body('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    body('correo').trim().isEmail().withMessage('Valid email is required'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

const updateEmailValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getEmails(req, res, next) {
    try {
        const emails = await emailService.getEmails();

        res.status(200).json({
            ok: true,
            count: emails.length,
            data: emails
        });
    } catch (error) {
        next(error);
    }
}

async function getEmailByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const email = await emailService.getEmailByPk(
            req.params.identificacion,
            req.params.correo
        );

        res.status(200).json({
            ok: true,
            data: email
        });
    } catch (error) {
        next(error);
    }
}

async function createEmail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const email = await emailService.createEmail(req.body);

        res.status(201).json({
            ok: true,
            message: 'Email created successfully',
            data: email
        });
    } catch (error) {
        next(error);
    }
}

async function updateEmail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const email = await emailService.updateEmail(
            req.params.identificacion,
            req.params.correo,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Email updated successfully',
            data: email
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEmail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await emailService.deleteEmail(req.params.identificacion, req.params.correo);

        res.status(200).json({
            ok: true,
            message: 'Email deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEmails,
    getEmailByPk,
    createEmail,
    updateEmail,
    deleteEmail,
    emailKeyValidation,
    createEmailValidation,
    updateEmailValidation
};
