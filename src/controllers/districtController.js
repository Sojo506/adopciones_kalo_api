const { body, param, validationResult } = require('express-validator');
const districtService = require('../services/districtService');

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

const districtIdValidation = [
    param('idDistrito').isInt({ min: 1 }).withMessage('ID Distrito must be a positive number')
];

const districtBodyValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idCanton').isInt({ min: 1 }).withMessage('ID Canton must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getDistricts(req, res, next) {
    try {
        const districts = await districtService.getDistricts();

        res.status(200).json({
            ok: true,
            count: districts.length,
            data: districts
        });
    } catch (error) {
        next(error);
    }
}

async function getDistrictById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const district = await districtService.getDistrictById(req.params.idDistrito);

        res.status(200).json({
            ok: true,
            data: district
        });
    } catch (error) {
        next(error);
    }
}

async function createDistrict(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const district = await districtService.createDistrict(req.body);

        res.status(201).json({
            ok: true,
            message: 'District created successfully',
            data: district
        });
    } catch (error) {
        next(error);
    }
}

async function updateDistrict(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const district = await districtService.updateDistrict(req.params.idDistrito, req.body);

        res.status(200).json({
            ok: true,
            message: 'District updated successfully',
            data: district
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDistrict(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await districtService.deleteDistrict(req.params.idDistrito);

        res.status(200).json({
            ok: true,
            message: 'District deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict,
    districtIdValidation,
    districtBodyValidation
};
