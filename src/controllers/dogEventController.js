const { body, param, validationResult } = require('express-validator');
const dogEventService = require('../services/dogEventService');

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

const dogEventIdValidation = [
    param('idEvento').isInt({ min: 1 }).withMessage('ID Evento must be a positive number')
];

const createDogEventValidation = [
    body('idPerrito').isInt({ min: 1 }).withMessage('ID Perrito must be a positive number'),
    body('idTipoEvento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Evento must be a positive number'),
    body('fechaEvento').isISO8601().withMessage('Event date must be a valid ISO-8601 date'),
    body('detalle')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Event detail is required and must be at most 500 characters'),
    body('totalGasto')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be zero or greater'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateDogEventValidation = [
    body('idPerrito').isInt({ min: 1 }).withMessage('ID Perrito must be a positive number'),
    body('idTipoEvento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Evento must be a positive number'),
    body('fechaEvento').isISO8601().withMessage('Event date must be a valid ISO-8601 date'),
    body('detalle')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Event detail is required and must be at most 500 characters'),
    body('totalGasto')
        .isFloat({ min: 0 })
        .withMessage('Total amount must be zero or greater'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getDogEvents(req, res, next) {
    try {
        const dogEvents = await dogEventService.getDogEvents();

        res.status(200).json({
            ok: true,
            count: dogEvents.length,
            data: dogEvents
        });
    } catch (error) {
        next(error);
    }
}

async function getDogEventById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogEvent = await dogEventService.getDogEventById(req.params.idEvento);

        res.status(200).json({
            ok: true,
            data: dogEvent
        });
    } catch (error) {
        next(error);
    }
}

async function createDogEvent(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogEvent = await dogEventService.createDogEvent(req.body);

        res.status(201).json({
            ok: true,
            message: 'Dog event created successfully',
            data: dogEvent
        });
    } catch (error) {
        next(error);
    }
}

async function updateDogEvent(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const dogEvent = await dogEventService.updateDogEvent(
            req.params.idEvento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Dog event updated successfully',
            data: dogEvent
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDogEvent(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await dogEventService.deleteDogEvent(req.params.idEvento);

        res.status(200).json({
            ok: true,
            message: 'Dog event deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getDogEvents,
    getDogEventById,
    createDogEvent,
    updateDogEvent,
    deleteDogEvent,
    dogEventIdValidation,
    createDogEventValidation,
    updateDogEventValidation
};
