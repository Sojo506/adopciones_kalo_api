const { body, param, validationResult } = require('express-validator');
const provinceService = require('../services/provinceService');

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

const provinceIdValidation = [
    param('idProvincia').isInt({ min: 1 }).withMessage('ID Provincia must be a positive number')
];

const provinceBodyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idPais').isInt({ min: 1 }).withMessage('ID Pais must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getProvinces(req, res, next) {
    try {
        const provinces = await provinceService.getProvinces();

        res.status(200).json({
            ok: true,
            count: provinces.length,
            data: provinces
        });
    } catch (error) {
        next(error);
    }
}

async function getProvinceById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const province = await provinceService.getProvinceById(req.params.idProvincia);

        res.status(200).json({
            ok: true,
            data: province
        });
    } catch (error) {
        next(error);
    }
}

async function createProvince(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const province = await provinceService.createProvince(req.body);

        res.status(201).json({
            ok: true,
            message: 'Province created successfully',
            data: province
        });
    } catch (error) {
        next(error);
    }
}

async function updateProvince(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const province = await provinceService.updateProvince(req.params.idProvincia, req.body);

        res.status(200).json({
            ok: true,
            message: 'Province updated successfully',
            data: province
        });
    } catch (error) {
        next(error);
    }
}

async function deleteProvince(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await provinceService.deleteProvince(req.params.idProvincia);

        res.status(200).json({
            ok: true,
            message: 'Province deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProvinces,
    getProvinceById,
    createProvince,
    updateProvince,
    deleteProvince,
    provinceIdValidation,
    provinceBodyValidation
};
