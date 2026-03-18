const { body, param, validationResult } = require('express-validator');
const sexService = require('../services/sexService');

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

const sexIdValidation = [
    param('idSexo').isInt({ min: 1 }).withMessage('ID Sexo must be a positive number')
];

const sexValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getSexes(req, res, next) {
    try {
        const sexes = await sexService.getSexes();

        res.status(200).json({
            ok: true,
            count: sexes.length,
            data: sexes
        });
    } catch (error) {
        next(error);
    }
}

async function getSexById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sex = await sexService.getSexById(req.params.idSexo);

        res.status(200).json({
            ok: true,
            data: sex
        });
    } catch (error) {
        next(error);
    }
}

async function createSex(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sex = await sexService.createSex(req.body);

        res.status(201).json({
            ok: true,
            message: 'Sex created successfully',
            data: sex
        });
    } catch (error) {
        next(error);
    }
}

async function updateSex(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const sex = await sexService.updateSex(req.params.idSexo, req.body);

        res.status(200).json({
            ok: true,
            message: 'Sex updated successfully',
            data: sex
        });
    } catch (error) {
        next(error);
    }
}

async function deleteSex(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await sexService.deleteSex(req.params.idSexo);

        res.status(200).json({
            ok: true,
            message: 'Sex deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSexes,
    getSexById,
    createSex,
    updateSex,
    deleteSex,
    sexIdValidation,
    sexValidation
};
