const { body, param, validationResult } = require('express-validator');
const dogImageService = require('../services/dogImageService');

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

const dogImageIdValidation = [
    param('idImagen')
        .isInt({ min: 1 })
        .withMessage('ID Imagen must be a positive number')
];

const dogIdValidation = [
    param('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number')
];

const dogImageCreateValidation = [
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const dogImageUpdateValidation = [
    body('idPerrito')
        .isInt({ min: 1 })
        .withMessage('ID Perrito must be a positive number'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getDogImagesByDog(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogImages = await dogImageService.getDogImagesByDog(
            req.params.idPerrito
        );

        res.status(200).json({
            ok: true,
            count: dogImages.length,
            data: dogImages
        });
    } catch (error) {
        next(error);
    }
}

async function getDogImageById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogImage = await dogImageService.getDogImageById(
            req.params.idImagen
        );

        res.status(200).json({
            ok: true,
            data: dogImage
        });
    } catch (error) {
        next(error);
    }
}

async function createDogImage(req, res, next) {
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

        const dogImage = await dogImageService.createDogImage(req.body, req.file);

        res.status(201).json({
            ok: true,
            message: 'Dog image uploaded successfully',
            data: dogImage
        });
    } catch (error) {
        next(error);
    }
}

async function updateDogImage(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogImage = await dogImageService.updateDogImage(
            req.params.idImagen,
            req.body,
            req.file
        );

        res.status(200).json({
            ok: true,
            message: 'Dog image updated successfully',
            data: dogImage
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDogImage(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await dogImageService.deleteDogImage(req.params.idImagen);

        res.status(200).json({
            ok: true,
            message: 'Dog image deactivated successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDogImagesByDog,
    getDogImageById,
    createDogImage,
    updateDogImage,
    deleteDogImage,
    dogImageIdValidation,
    dogIdValidation,
    dogImageCreateValidation,
    dogImageUpdateValidation
};
