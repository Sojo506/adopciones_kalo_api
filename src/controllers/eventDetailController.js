const { body, param, validationResult } = require('express-validator');
const eventDetailService = require('../services/eventDetailService');

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

const eventDetailIdValidation = [
    param('idDetalleEvento')
        .isInt({ min: 1 })
        .withMessage('ID Detalle Evento must be a positive number')
];

const dogEventIdValidation = [
    param('idEvento')
        .isInt({ min: 1 })
        .withMessage('ID Evento must be a positive number')
];

const createEventDetailValidation = [
    body('idEvento')
        .isInt({ min: 1 })
        .withMessage('ID Evento must be a positive number'),
    body('descripcion')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Description is required and must be at most 500 characters'),
    body('monto')
        .isFloat({ min: 0 })
        .withMessage('Amount must be zero or greater'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateEventDetailValidation = [
    body('idEvento')
        .isInt({ min: 1 })
        .withMessage('ID Evento must be a positive number'),
    body('descripcion')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Description is required and must be at most 500 characters'),
    body('monto')
        .isFloat({ min: 0 })
        .withMessage('Amount must be zero or greater'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getEventDetails(req, res, next) {
    try {
        const eventDetails = await eventDetailService.getEventDetails();

        res.status(200).json({
            ok: true,
            count: eventDetails.length,
            data: eventDetails
        });
    } catch (error) {
        next(error);
    }
}

async function getEventDetailsByEvent(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventDetails = await eventDetailService.getEventDetailsByEvent(
            req.params.idEvento
        );

        res.status(200).json({
            ok: true,
            count: eventDetails.length,
            data: eventDetails
        });
    } catch (error) {
        next(error);
    }
}

async function getEventDetailById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventDetail = await eventDetailService.getEventDetailById(
            req.params.idDetalleEvento
        );

        res.status(200).json({
            ok: true,
            data: eventDetail
        });
    } catch (error) {
        next(error);
    }
}

async function createEventDetail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        if (!req.file) {
            res.status(400).json({
                ok: false,
                message: 'Receipt image file is required'
            });
            return;
        }

        const eventDetail = await eventDetailService.createEventDetail(req.body, req.file);

        res.status(201).json({
            ok: true,
            message: 'Event detail created successfully',
            data: eventDetail
        });
    } catch (error) {
        next(error);
    }
}

async function updateEventDetail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const eventDetail = await eventDetailService.updateEventDetail(
            req.params.idDetalleEvento,
            req.body,
            req.file
        );

        res.status(200).json({
            ok: true,
            message: 'Event detail updated successfully',
            data: eventDetail
        });
    } catch (error) {
        next(error);
    }
}

async function deleteEventDetail(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await eventDetailService.deleteEventDetail(req.params.idDetalleEvento);

        res.status(200).json({
            ok: true,
            message: 'Event detail deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getEventDetails,
    getEventDetailsByEvent,
    getEventDetailById,
    createEventDetail,
    updateEventDetail,
    deleteEventDetail,
    eventDetailIdValidation,
    dogEventIdValidation,
    createEventDetailValidation,
    updateEventDetailValidation
};
