const { param, validationResult } = require('express-validator');
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

module.exports = {
    getAvailableDogs,
    getDogById,
    dogIdValidation
};
