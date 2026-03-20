const { body, param, validationResult } = require('express-validator');
const requestQuestionService = require('../services/requestQuestionService');

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

const requestQuestionKeyValidation = [
    param('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    param('idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number')
];

const createRequestQuestionValidation = [
    body('idSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Solicitud must be a positive number'),
    body('idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateRequestQuestionValidation = [
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getRequestQuestions(req, res, next) {
    try {
        const requestQuestions = await requestQuestionService.getRequestQuestions();

        res.status(200).json({
            ok: true,
            count: requestQuestions.length,
            data: requestQuestions
        });
    } catch (error) {
        next(error);
    }
}

async function getRequestQuestionByPk(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestQuestion = await requestQuestionService.getRequestQuestionByPk(
            req.params.idSolicitud,
            req.params.idPregunta
        );

        res.status(200).json({
            ok: true,
            data: requestQuestion
        });
    } catch (error) {
        next(error);
    }
}

async function createRequestQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestQuestion = await requestQuestionService.createRequestQuestion(req.body);

        res.status(201).json({
            ok: true,
            message: 'Request-question relation created successfully',
            data: requestQuestion
        });
    } catch (error) {
        next(error);
    }
}

async function updateRequestQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const requestQuestion = await requestQuestionService.updateRequestQuestion(
            req.params.idSolicitud,
            req.params.idPregunta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Request-question relation updated successfully',
            data: requestQuestion
        });
    } catch (error) {
        next(error);
    }
}

async function deleteRequestQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await requestQuestionService.deleteRequestQuestion(
            req.params.idSolicitud,
            req.params.idPregunta
        );

        res.status(200).json({
            ok: true,
            message: 'Request-question relation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRequestQuestions,
    getRequestQuestionByPk,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion,
    requestQuestionKeyValidation,
    createRequestQuestionValidation,
    updateRequestQuestionValidation
};
