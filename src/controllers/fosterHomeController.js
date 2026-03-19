const { body, param, validationResult } = require('express-validator');
const fosterHomeService = require('../services/fosterHomeService');

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

const fosterHomeIdValidation = [
    param('idCasaCuna')
        .isInt({ min: 1 })
        .withMessage('ID Casa Cuna must be a positive number')
];

const fosterHomeBodyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idDireccion')
        .isInt({ min: 1 })
        .withMessage('ID Direccion must be a positive number'),
    body('identificacion')
        .trim()
        .matches(/^\d{1,20}$/)
        .withMessage('Identificacion is required and must contain only digits'),
    body('idSolicitud')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getFosterHomes(req, res, next) {
    try {
        const fosterHomes = await fosterHomeService.getFosterHomes();

        res.status(200).json({
            ok: true,
            count: fosterHomes.length,
            data: fosterHomes
        });
    } catch (error) {
        next(error);
    }
}

async function getFosterHomeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const fosterHome = await fosterHomeService.getFosterHomeById(req.params.idCasaCuna);

        res.status(200).json({
            ok: true,
            data: fosterHome
        });
    } catch (error) {
        next(error);
    }
}

async function createFosterHome(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const fosterHome = await fosterHomeService.createFosterHome(req.body);

        res.status(201).json({
            ok: true,
            message: 'Foster home created successfully',
            data: fosterHome
        });
    } catch (error) {
        next(error);
    }
}

async function updateFosterHome(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const fosterHome = await fosterHomeService.updateFosterHome(
            req.params.idCasaCuna,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Foster home updated successfully',
            data: fosterHome
        });
    } catch (error) {
        next(error);
    }
}

async function deleteFosterHome(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await fosterHomeService.deleteFosterHome(req.params.idCasaCuna);

        res.status(200).json({
            ok: true,
            message: 'Foster home deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getFosterHomes,
    getFosterHomeById,
    createFosterHome,
    updateFosterHome,
    deleteFosterHome,
    fosterHomeIdValidation,
    fosterHomeBodyValidation
};
