const { body, param, validationResult } = require('express-validator');
const eventTypeService = require('../services/eventTypeService');

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

const eventTypeIdValidation = [
    param('idTipoEvento')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Evento must be a positive number')
];

const eventTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getEventTypes(req, res, next) {
    try {
        const eventTypes = await eventTypeService.getEventTypes();

        res.status(200).json({
            ok: true,
            count: eventTypes.length,
            data: eventTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getEventTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventType = await eventTypeService.getEventTypeById(req.params.idTipoEvento);

        res.status(200).json({
            ok: true,
            data: eventType
        });
    } catch (error) {
        next(error);
    }
}

async function createEventType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventType = await eventTypeService.createEventType(req.body);

        res.status(201).json({
            ok: true,
            message: 'Event type created successfully',
            data: eventType
        });
    } catch (error) {
        next(error);
    }
}

async function updateEventType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventType = await eventTypeService.updateEventType(
            req.params.idTipoEvento,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Event type updated successfully',
            data: eventType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEventType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await eventTypeService.deleteEventType(req.params.idTipoEvento);

        res.status(200).json({
            ok: true,
            message: 'Event type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEventTypes,
    getEventTypeById,
    createEventType,
    updateEventType,
    deleteEventType,
    eventTypeIdValidation,
    eventTypeValidation
};
