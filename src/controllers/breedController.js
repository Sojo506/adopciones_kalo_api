const { body, param, validationResult } = require('express-validator');
const breedService = require('../services/breedService');

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

const breedIdValidation = [
    param('idRaza').isInt({ min: 1 }).withMessage('ID Raza must be a positive number')
];

const breedValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getBreeds(req, res, next) {
    try {
        const breeds = await breedService.getBreeds();

        res.status(200).json({
            ok: true,
            count: breeds.length,
            data: breeds
        });
    } catch (error) {
        next(error);
    }
}

async function getBreedById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const breed = await breedService.getBreedById(req.params.idRaza);

        res.status(200).json({
            ok: true,
            data: breed
        });
    } catch (error) {
        next(error);
    }
}

async function createBreed(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const breed = await breedService.createBreed(req.body);

        res.status(201).json({
            ok: true,
            message: 'Breed created successfully',
            data: breed
        });
    } catch (error) {
        next(error);
    }
}

async function updateBreed(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const breed = await breedService.updateBreed(req.params.idRaza, req.body);

        res.status(200).json({
            ok: true,
            message: 'Breed updated successfully',
            data: breed
        });
    } catch (error) {
        next(error);
    }
}

async function deleteBreed(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await breedService.deleteBreed(req.params.idRaza);

        res.status(200).json({
            ok: true,
            message: 'Breed deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getBreeds,
    getBreedById,
    createBreed,
    updateBreed,
    deleteBreed,
    breedIdValidation,
    breedValidation
};
