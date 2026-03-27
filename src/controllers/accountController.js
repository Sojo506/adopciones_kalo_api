const { body, param, validationResult } = require('express-validator');
const accountService = require('../services/accountService');

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

const accountIdValidation = [
    param('idCuenta').isInt({ min: 1 }).withMessage('ID Cuenta must be a positive number')
];

const createAccountValidation = [
    body('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    body('usuario')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Usuario is required and must be at most 100 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

const updateAccountValidation = [
    body('identificacion').isInt({ min: 1 }).withMessage('Identificacion must be a positive number'),
    body('usuario')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Usuario is required and must be at most 100 characters'),
    body('password')
        .optional({ values: 'falsy' })
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getAccounts(req, res, next) {
    try {
        const accounts = await accountService.getAccounts();

        res.status(200).json({
            ok: true,
            count: accounts.length,
            data: accounts
        });
    } catch (error) {
        next(error);
    }
}

async function getAccountById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const account = await accountService.getAccountById(req.params.idCuenta);

        res.status(200).json({
            ok: true,
            data: account
        });
    } catch (error) {
        next(error);
    }
}

async function createAccount(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const account = await accountService.createAccount(req.body);

        res.status(201).json({
            ok: true,
            message: 'Account created successfully',
            data: account
        });
    } catch (error) {
        next(error);
    }
}

async function updateAccount(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const account = await accountService.updateAccount(
            req.params.idCuenta,
            req.body,
            req.authenticatedAccount
        );

        res.status(200).json({
            ok: true,
            message: 'Account updated successfully',
            data: account
        });
    } catch (error) {
        next(error);
    }
}

async function deleteAccount(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await accountService.deleteAccount(req.params.idCuenta, req.authenticatedAccount);

        res.status(200).json({
            ok: true,
            message: 'Account deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAccounts,
    getAccountById,
    createAccount,
    updateAccount,
    deleteAccount,
    accountIdValidation,
    createAccountValidation,
    updateAccountValidation
};
