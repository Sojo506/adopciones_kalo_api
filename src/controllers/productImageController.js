const { body, param, validationResult } = require('express-validator');
const productImageService = require('../services/productImageService');

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

const productImageIdValidation = [
    param('idImagen')
        .isInt({ min: 1 })
        .withMessage('ID Imagen must be a positive number')
];

const productIdValidation = [
    param('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number')
];

const productImageCreateValidation = [
    body('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const productImageUpdateValidation = [
    body('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getProductImagesByProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const productImages = await productImageService.getProductImagesByProduct(
            req.params.idProducto
        );

        res.status(200).json({
            ok: true,
            count: productImages.length,
            data: productImages
        });
    } catch (error) {
        next(error);
    }
}

async function getProductImageById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const productImage = await productImageService.getProductImageById(
            req.params.idImagen
        );

        res.status(200).json({
            ok: true,
            data: productImage
        });
    } catch (error) {
        next(error);
    }
}

async function createProductImage(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        if (!req.file) {
            res.status(400).json({
                ok: false,
                message: 'Image file is required'
            });
            return;
        }

        const productImage = await productImageService.createProductImage(req.body, req.file);

        res.status(201).json({
            ok: true,
            message: 'Product image uploaded successfully',
            data: productImage
        });
    } catch (error) {
        next(error);
    }
}

async function updateProductImage(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const productImage = await productImageService.updateProductImage(
            req.params.idImagen,
            req.body,
            req.file
        );

        res.status(200).json({
            ok: true,
            message: 'Product image updated successfully',
            data: productImage
        });
    } catch (error) {
        next(error);
    }
}

async function deleteProductImage(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await productImageService.deleteProductImage(req.params.idImagen);

        res.status(200).json({
            ok: true,
            message: 'Product image deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProductImagesByProduct,
    getProductImageById,
    createProductImage,
    updateProductImage,
    deleteProductImage,
    productImageIdValidation,
    productIdValidation,
    productImageCreateValidation,
    productImageUpdateValidation
};
