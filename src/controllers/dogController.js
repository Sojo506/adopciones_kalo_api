const { body, param, validationResult } = require('express-validator');
const dogService = require('../services/dogService');

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

const dogIdValidation = [
    param('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number')
];

const createDogValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('fechaIngreso').isISO8601().withMessage('Entry date must be a valid ISO-8601 date'),
    body('edad')
        .isInt({ min: 0 })
        .withMessage('Age must be a whole number zero or greater'),
    body('peso')
        .isFloat({ gt: 0 })
        .withMessage('Weight must be greater than zero'),
    body('estatura')
        .isFloat({ gt: 0 })
        .withMessage('Height must be greater than zero'),
    body('idSexo').isInt({ min: 1 }).withMessage('ID Sexo must be a positive number'),
    body('idRaza').isInt({ min: 1 }).withMessage('ID Raza must be a positive number'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateDogValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('edad')
        .isInt({ min: 0 })
        .withMessage('Age must be a whole number zero or greater'),
    body('peso')
        .isFloat({ gt: 0 })
        .withMessage('Weight must be greater than zero'),
    body('estatura')
        .isFloat({ gt: 0 })
        .withMessage('Height must be greater than zero'),
    body('idSexo').isInt({ min: 1 }).withMessage('ID Sexo must be a positive number'),
    body('idRaza').isInt({ min: 1 }).withMessage('ID Raza must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getAvailableDogs(req, res, next) {
    try {
        const dogs = await dogService.getAvailableDogs();

        res.status(200).json({
            ok: true,
            count: dogs.length,
            data: dogs
        });
    } catch (error) {
        next(error);
    }
}

async function getDogs(req, res, next) {
    try {
        const dogs = await dogService.getDogs();

        res.status(200).json({
            ok: true,
            count: dogs.length,
            data: dogs
        });
    } catch (error) {
        next(error);
    }
}

async function getDogById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dog = await dogService.getDogById(req.params.idPerrito);

        res.status(200).json({
            ok: true,
            data: dog
        });
    } catch (error) {
        next(error);
    }
}

async function getDogByIdForAdmin(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dog = await dogService.getDogByIdForAdmin(req.params.idPerrito);

        res.status(200).json({
            ok: true,
            data: dog
        });
    } catch (error) {
        next(error);
    }
}

async function createDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dog = await dogService.createDog(req.body);

        res.status(201).json({
            ok: true,
            message: 'Dog created successfully',
            data: dog
        });
    } catch (error) {
        next(error);
    }
}

async function updateDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dog = await dogService.updateDog(req.params.idPerrito, req.body);

        res.status(200).json({
            ok: true,
            message: 'Dog updated successfully',
            data: dog
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await dogService.deleteDog(req.params.idPerrito);

        res.status(200).json({
            ok: true,
            message: 'Dog deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDogs,
    getAvailableDogs,
    getDogById,
    getDogByIdForAdmin,
    createDog,
    updateDog,
    deleteDog,
    dogIdValidation,
    createDogValidation,
    updateDogValidation
};
