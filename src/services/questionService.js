const catalogService = require('./catalogService');
const questionRepository = require('../repositories/questionRepository');
const responseTypeRepository = require('../repositories/responseTypeRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const QUESTION_LIST_CACHE_KEY = 'question:list';
const QUESTION_DETAIL_CACHE_PREFIX = 'question:detail:';
const QUESTION_CACHE_TTL_MS = Number(process.env.QUESTION_CACHE_TTL_MS || 15000);
const questionQueryCache = new MemoryCache({
    defaultTtlMs: QUESTION_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeQuestionText(value) {
    return String(value || '').trim().toLowerCase();
}

function getQuestionDetailCacheKey(idPregunta) {
    return `${QUESTION_DETAIL_CACHE_PREFIX}${String(idPregunta).trim()}`;
}

function invalidateQuestionCache(idPregunta) {
    questionQueryCache.delete(QUESTION_LIST_CACHE_KEY);

    if (idPregunta !== undefined && idPregunta !== null) {
        questionQueryCache.delete(getQuestionDetailCacheKey(idPregunta));
        return;
    }

    questionQueryCache.clearByPrefix(QUESTION_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idPregunta = null) {
    invalidateQuestionCache(idPregunta);
    catalogService.invalidateQuestionsCache();
}

function formatQuestion(question) {
    return {
        idPregunta: question.ID_PREGUNTA,
        pregunta: question.PREGUNTA,
        idTipoRespuesta: question.ID_TIPO_RESPUESTA,
        tipoRespuesta: question.TIPO_RESPUESTA || null,
        idEstado: question.ID_ESTADO,
        estado: question.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureResponseTypeExists(idTipoRespuesta) {
    const responseType = await responseTypeRepository.findResponseTypeById(idTipoRespuesta);

    if (!responseType) {
        throw createHttpError('Response type not found', 400);
    }

    return responseType;
}

async function ensureQuestionResponseTypeAssignmentIsValid(responseType, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(responseType.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep a question active under an inactive response type',
            409
        );
    }
}

async function ensureQuestionTextIsAvailable(pregunta, { excludeId = null } = {}) {
    const normalizedQuestion = normalizeQuestionText(pregunta);
    const questions = await getQuestions();
    const duplicatedQuestion = questions.find(
        (question) =>
            normalizeQuestionText(question.pregunta) === normalizedQuestion &&
            Number(question.idPregunta) !== Number(excludeId)
    );

    if (duplicatedQuestion) {
        throw createHttpError('Question text already exists', 409);
    }
}

async function getActiveResponsesCount(idPregunta) {
    return questionRepository.countActiveResponsesByQuestion(idPregunta);
}

async function getActiveAssignmentsCount(idPregunta) {
    return questionRepository.countActiveAssignmentsByQuestion(idPregunta);
}

async function ensureQuestionCanBeDisabled(existingQuestion, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingQuestion.idEstado)) {
        return;
    }

    const activeAssignmentsCount = await getActiveAssignmentsCount(existingQuestion.idPregunta);

    if (activeAssignmentsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a question that is still assigned to active forms',
            409
        );
    }

    const activeResponsesCount = await getActiveResponsesCount(existingQuestion.idPregunta);

    if (activeResponsesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a question that still has active responses',
            409
        );
    }
}

async function ensureQuestionResponseTypeCanChange(existingQuestion, nextResponseType) {
    if (Number(existingQuestion.idTipoRespuesta) === Number(nextResponseType)) {
        return;
    }

    const activeResponsesCount = await getActiveResponsesCount(existingQuestion.idPregunta);

    if (activeResponsesCount > 0) {
        throw createHttpError(
            'Cannot change the response type of a question that already has active responses',
            409
        );
    }
}

async function ensureQuestionCanBeDeleted(existingQuestion) {
    if (isInactiveState(existingQuestion.idEstado)) {
        throw createHttpError('Question is already inactive', 409);
    }

    const activeAssignmentsCount = await getActiveAssignmentsCount(existingQuestion.idPregunta);

    if (activeAssignmentsCount > 0) {
        throw createHttpError(
            'Cannot delete a question that is still assigned to active forms',
            409
        );
    }

    const activeResponsesCount = await getActiveResponsesCount(existingQuestion.idPregunta);

    if (activeResponsesCount > 0) {
        throw createHttpError(
            'Cannot delete a question that still has active responses',
            409
        );
    }
}

async function getQuestions() {
    return questionQueryCache.getOrSet(QUESTION_LIST_CACHE_KEY, async () => {
        const questions = await questionRepository.findAllQuestionsForAdmin();
        return questions.map(formatQuestion);
    });
}

async function getQuestionById(idPregunta) {
    return questionQueryCache.getOrSet(getQuestionDetailCacheKey(idPregunta), async () => {
        const question = await questionRepository.findQuestionById(idPregunta);

        if (!question) {
            throw createHttpError('Question not found', 404);
        }

        return formatQuestion(question);
    });
}

async function createQuestion(questionData) {
    const payload = {
        pregunta: String(questionData.pregunta || '').trim(),
        idTipoRespuesta: Number(questionData.idTipoRespuesta),
        idEstado: Number(questionData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const responseType = await ensureResponseTypeExists(payload.idTipoRespuesta);
    await ensureQuestionResponseTypeAssignmentIsValid(responseType, payload.idEstado);
    await ensureQuestionTextIsAvailable(payload.pregunta);

    const result = await questionRepository.createQuestion(payload);
    invalidateRelatedCaches(result.idPregunta);

    return getQuestionById(result.idPregunta);
}

async function updateQuestion(idPregunta, questionData) {
    const existingQuestion = await getQuestionById(idPregunta);
    const payload = {
        idPregunta: Number(idPregunta),
        pregunta: String(questionData.pregunta || '').trim(),
        idTipoRespuesta: Number(questionData.idTipoRespuesta),
        idEstado: Number(questionData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const responseType = await ensureResponseTypeExists(payload.idTipoRespuesta);
    await ensureQuestionResponseTypeAssignmentIsValid(responseType, payload.idEstado);
    await ensureQuestionTextIsAvailable(payload.pregunta, {
        excludeId: payload.idPregunta
    });
    await ensureQuestionCanBeDisabled(existingQuestion, payload.idEstado);
    await ensureQuestionResponseTypeCanChange(existingQuestion, payload.idTipoRespuesta);

    await questionRepository.updateQuestion(payload);
    invalidateRelatedCaches(payload.idPregunta);

    return getQuestionById(payload.idPregunta);
}

async function deleteQuestion(idPregunta) {
    const existingQuestion = await getQuestionById(idPregunta);

    await ensureQuestionCanBeDeleted(existingQuestion);
    await questionRepository.deleteQuestion(idPregunta);
    invalidateRelatedCaches(idPregunta);
}

module.exports = {
    getQuestions,
    getQuestionById,
    createQuestion,
    updateQuestion,
    deleteQuestion
};
