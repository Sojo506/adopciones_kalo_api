const { body, param, validationResult } = require('express-validator');
const saleProductService = require('../services/saleProductService');

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

const saleProductKeyValidation = [
    param('idVenta').isInt({ min: 1 }).withMessage('ID Venta must be a positive number'),
    param('idProducto').isInt({ min: 1 }).withMessage('ID Producto must be a positive number')
];

const createSaleProductValidation = [
    body('idVenta').isInt({ min: 1 }).withMessage('ID Venta must be a positive number'),
    body('idProducto').isInt({ min: 1 }).withMessage('ID Producto must be a positive number'),
    body('idTipoMovimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Movimiento must be a positive number'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad must be a positive integer'),
    body('precioUnitario')
        .isFloat({ min: 0 })
        .withMessage('Unit price must be greater than or equal to zero'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

const updateSaleProductValidation = [
    body('idTipoMovimiento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Movimiento must be a positive number'),
    body('cantidad').isInt({ min: 1 }).withMessage('Cantidad must be a positive integer'),
    body('precioUnitario')
        .isFloat({ min: 0 })
        .withMessage('Unit price must be greater than or equal to zero'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getSaleProducts(req, res, next) {
    try {
        const saleProducts = await saleProductService.getSaleProducts();

        res.status(200).json({
            ok: true,
            count: saleProducts.length,
            data: saleProducts
        });
    } catch (error) {
        next(error);
    }
}

async function getSaleProductByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleProduct = await saleProductService.getSaleProductByPk(
            req.params.idVenta,
            req.params.idProducto
        );

        res.status(200).json({
            ok: true,
            data: saleProduct
        });
    } catch (error) {
        next(error);
    }
}

async function createSaleProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleProduct = await saleProductService.createSaleProduct(req.body);

        res.status(201).json({
            ok: true,
            message: 'Sale detail created successfully',
            data: saleProduct
        });
    } catch (error) {
        next(error);
    }
}

async function updateSaleProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const saleProduct = await saleProductService.updateSaleProduct(
            req.params.idVenta,
            req.params.idProducto,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Sale detail updated successfully',
            data: saleProduct
        });
    } catch (error) {
        next(error);
    }
}

async function deleteSaleProduct(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await saleProductService.deleteSaleProduct(req.params.idVenta, req.params.idProducto);

        res.status(200).json({
            ok: true,
            message: 'Sale detail deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSaleProducts,
    getSaleProductByPk,
    createSaleProduct,
    updateSaleProduct,
    deleteSaleProduct,
    saleProductKeyValidation,
    createSaleProductValidation,
    updateSaleProductValidation
};
