const { body, param, validationResult } = require('express-validator');
const questionService = require('../services/questionService');

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

const questionIdValidation = [
    param('idPregunta')
        .isInt({ min: 1 })
        .withMessage('ID Pregunta must be a positive number')
];

const questionValidation = [
    body('pregunta')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('Pregunta is required and must be at most 500 characters'),
    body('idTipoRespuesta')
        .isInt({ min: 1 })
        .withMessage('ID Tipo Respuesta must be a positive number'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getQuestions(req, res, next) {
    try {
        const questions = await questionService.getQuestions();

        res.status(200).json({
            ok: true,
            count: questions.length,
            data: questions
        });
    } catch (error) {
        next(error);
    }
}

async function getQuestionById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const question = await questionService.getQuestionById(req.params.idPregunta);

        res.status(200).json({
            ok: true,
            data: question
        });
    } catch (error) {
        next(error);
    }
}

async function createQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const question = await questionService.createQuestion(req.body);

        res.status(201).json({
            ok: true,
            message: 'Question created successfully',
            data: question
        });
    } catch (error) {
        next(error);
    }
}

async function updateQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const question = await questionService.updateQuestion(
            req.params.idPregunta,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Question updated successfully',
            data: question
        });
    } catch (error) {
        next(error);
    }
}

async function deleteQuestion(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await questionService.deleteQuestion(req.params.idPregunta);

        res.status(200).json({
            ok: true,
            message: 'Question deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    questionIdValidation,
    questionValidation
};
