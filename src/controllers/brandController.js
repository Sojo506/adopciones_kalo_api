const { body, param, validationResult } = require('express-validator');
const brandService = require('../services/brandService');

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

const brandIdValidation = [
    param('idMarca').isInt({ min: 1 }).withMessage('ID Marca must be a positive number')
];

const brandValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getBrands(req, res, next) {
    try {
        const brands = await brandService.getBrands();

        res.status(200).json({
            ok: true,
            count: brands.length,
            data: brands
        });
    } catch (error) {
        next(error);
    }
}

async function getBrandById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const brand = await brandService.getBrandById(req.params.idMarca);

        res.status(200).json({
            ok: true,
            data: brand
        });
    } catch (error) {
        next(error);
    }
}

async function createBrand(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const brand = await brandService.createBrand(req.body);

        res.status(201).json({
            ok: true,
            message: 'Brand created successfully',
            data: brand
        });
    } catch (error) {
        next(error);
    }
}

async function updateBrand(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const brand = await brandService.updateBrand(req.params.idMarca, req.body);

        res.status(200).json({
            ok: true,
            message: 'Brand updated successfully',
            data: brand
        });
    } catch (error) {
        next(error);
    }
}

async function deleteBrand(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await brandService.deleteBrand(req.params.idMarca);

        res.status(200).json({
            ok: true,
            message: 'Brand deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand,
    brandIdValidation,
    brandValidation
};
