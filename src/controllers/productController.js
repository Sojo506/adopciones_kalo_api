const { body, param, validationResult } = require('express-validator');
const productService = require('../services/productService');

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

const productIdValidation = [
    param('idProducto')
        .isInt({ min: 1 })
        .withMessage('ID Producto must be a positive number')
];

const productValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('descripcion')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descripcion must be at most 500 characters'),
    body('precio')
        .isFloat({ gt: 0 })
        .withMessage('Precio must be greater than zero'),
    body('idCategoria')
        .isInt({ min: 1 })
        .withMessage('ID Categoria must be a positive number'),
    body('idMarca')
        .isInt({ min: 1 })
        .withMessage('ID Marca must be a positive number'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getProducts(req, res, next) {
    try {
        const products = await productService.getProducts();

        res.status(200).json({
            ok: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        next(error);
    }
}

async function getProductById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const product = await productService.getProductById(req.params.idProducto);

        res.status(200).json({
            ok: true,
            data: product
        });
    } catch (error) {
        next(error);
    }
}

async function createProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const product = await productService.createProduct(req.body);

        res.status(201).json({
            ok: true,
            message: 'Product created successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
}

async function updateProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const product = await productService.updateProduct(
            req.params.idProducto,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Product updated successfully',
            data: product
        });
    } catch (error) {
        next(error);
    }
}

async function deleteProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await productService.deleteProduct(req.params.idProducto);

        res.status(200).json({
            ok: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    productIdValidation,
    productValidation
};
