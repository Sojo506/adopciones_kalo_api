const { body, param, validationResult } = require('express-validator');
const categoryService = require('../services/categoryService');

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

const categoryIdValidation = [
    param('idCategoria').isInt({ min: 1 }).withMessage('ID Categoria must be a positive number')
];

const categoryValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getCategories(req, res, next) {
    try {
        const categories = await categoryService.getCategories();

        res.status(200).json({
            ok: true,
            count: categories.length,
            data: categories
        });
    } catch (error) {
        next(error);
    }
}

async function getCategoryById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const category = await categoryService.getCategoryById(req.params.idCategoria);

        res.status(200).json({
            ok: true,
            data: category
        });
    } catch (error) {
        next(error);
    }
}

async function createCategory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const category = await categoryService.createCategory(req.body);

        res.status(201).json({
            ok: true,
            message: 'Category created successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
}

async function updateCategory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const category = await categoryService.updateCategory(req.params.idCategoria, req.body);

        res.status(200).json({
            ok: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCategory(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await categoryService.deleteCategory(req.params.idCategoria);

        res.status(200).json({
            ok: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    categoryIdValidation,
    categoryValidation
};
