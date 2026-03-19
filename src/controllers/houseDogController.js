const { body, param, validationResult } = require('express-validator');
const houseDogService = require('../services/houseDogService');

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

const houseDogKeyValidation = [
    param('idCasaCuna')
        .isInt({ min: 1 })
        .withMessage('ID Casa Cuna must be a positive number'),
    param('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number')
];

const createHouseDogValidation = [
    body('idCasaCuna')
        .isInt({ min: 1 })
        .withMessage('ID Casa Cuna must be a positive number'),
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateHouseDogValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getHouseDogs(req, res, next) {
    try {
        const houseDogs = await houseDogService.getHouseDogs();

        res.status(200).json({
            ok: true,
            count: houseDogs.length,
            data: houseDogs
        });
    } catch (error) {
        next(error);
    }
}

async function getHouseDogByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const houseDog = await houseDogService.getHouseDogByPk(
            req.params.idCasaCuna,
            req.params.idPerrito
        );

        res.status(200).json({
            ok: true,
            data: houseDog
        });
    } catch (error) {
        next(error);
    }
}

async function createHouseDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const houseDog = await houseDogService.createHouseDog(req.body);

        res.status(201).json({
            ok: true,
            message: 'House-dog relation created successfully',
            data: houseDog
        });
    } catch (error) {
        next(error);
    }
}

async function updateHouseDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const houseDog = await houseDogService.updateHouseDog(
            req.params.idCasaCuna,
            req.params.idPerrito,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'House-dog relation updated successfully',
            data: houseDog
        });
    } catch (error) {
        next(error);
    }
}

async function deleteHouseDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await houseDogService.deleteHouseDog(
            req.params.idCasaCuna,
            req.params.idPerrito
        );

        res.status(200).json({
            ok: true,
            message: 'House-dog relation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getHouseDogs,
    getHouseDogByPk,
    createHouseDog,
    updateHouseDog,
    deleteHouseDog,
    houseDogKeyValidation,
    createHouseDogValidation,
    updateHouseDogValidation
};
