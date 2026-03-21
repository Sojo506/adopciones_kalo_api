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
    param('idTipoSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Solicitud must be a positive number'),
    param('idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number')
];

const requestTypeIdValidation = [
    param('idTipoSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Solicitud must be a positive number')
];

const createRequestQuestionValidation = [
    body('idTipoSolicitud')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Solicitud must be a positive number'),
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

async function getActiveQuestionsByRequestType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const questions = await requestQuestionService.getActiveQuestionsByRequestType(
            req.params.idTipoSolicitud
        );

        res.status(200).json({
            ok: true,
            count: questions.length,
            data: questions
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
            req.params.idTipoSolicitud,
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
            message: 'Request-type-question relation created successfully',
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
            req.params.idTipoSolicitud,
            req.params.idPregunta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Request-type-question relation updated successfully',
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
            req.params.idTipoSolicitud,
            req.params.idPregunta
        );

        res.status(200).json({
            ok: true,
            message: 'Request-type-question relation deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getRequestQuestions,
    getActiveQuestionsByRequestType,
    getRequestQuestionByPk,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion,
    requestTypeIdValidation,
    requestQuestionKeyValidation,
    createRequestQuestionValidation,
    updateRequestQuestionValidation
};
