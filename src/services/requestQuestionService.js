const catalogService = require('./catalogService');
const questionService = require('./questionService');
const requestQuestionRepository = require('../repositories/requestQuestionRepository');
const requestService = require('./requestService');
const MemoryCache = require('../utils/memoryCache');

const REQUEST_QUESTION_LIST_CACHE_KEY = 'request-question:list';
const REQUEST_QUESTION_DETAIL_CACHE_PREFIX = 'request-question:detail:';
const REQUEST_QUESTION_CACHE_TTL_MS = Number(
    process.env.REQUEST_QUESTION_CACHE_TTL_MS || 15000
);
const requestQuestionQueryCache = new MemoryCache({
    defaultTtlMs: REQUEST_QUESTION_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeRequestQuestionKey(idSolicitud, idPregunta) {
    return `${String(idSolicitud).trim()}:${String(idPregunta).trim()}`;
}

function getRequestQuestionDetailCacheKey(idSolicitud, idPregunta) {
    return `${REQUEST_QUESTION_DETAIL_CACHE_PREFIX}${normalizeRequestQuestionKey(idSolicitud, idPregunta)}`;
}

function invalidateRequestQuestionCache(idSolicitud, idPregunta) {
    requestQuestionQueryCache.delete(REQUEST_QUESTION_LIST_CACHE_KEY);

    if (
        idSolicitud !== undefined &&
        idSolicitud !== null &&
        idPregunta !== undefined &&
        idPregunta !== null
    ) {
        requestQuestionQueryCache.delete(
            getRequestQuestionDetailCacheKey(idSolicitud, idPregunta)
        );
        return;
    }

    requestQuestionQueryCache.clearByPrefix(REQUEST_QUESTION_DETAIL_CACHE_PREFIX);
}

function formatRequestQuestion(requestQuestion) {
    return {
        idSolicitud: Number(requestQuestion.ID_SOLICITUD),
        identificacion: requestQuestion.IDENTIFICACION,
        solicitante: requestQuestion.SOLICITANTE || null,
        idTipoSolicitud: Number(requestQuestion.ID_TIPO_SOLICITUD),
        tipoSolicitud: requestQuestion.TIPO_SOLICITUD || null,
        idPregunta: Number(requestQuestion.ID_PREGUNTA),
        pregunta: requestQuestion.PREGUNTA || null,
        idTipoRespuesta: Number(requestQuestion.ID_TIPO_RESPUESTA),
        tipoRespuesta: requestQuestion.TIPO_RESPUESTA || null,
        idEstado: Number(requestQuestion.ID_ESTADO),
        estado: requestQuestion.ESTADO_RELACION || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

function ensureActiveRequestQuestionCanBeApplied({ request, question, idEstado }) {
    if (Number(idEstado) !== 1) {
        return;
    }

    if (Number(request.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a request-question relation active for an inactive request',
            409
        );
    }

    if (Number(question.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a request-question relation active for an inactive question',
            409
        );
    }
}

async function ensureNoActiveResponses(idSolicitud, idPregunta, action) {
    const activeResponsesCount =
        await requestQuestionRepository.countActiveResponsesByAssignment(
            idSolicitud,
            idPregunta
        );

    if (activeResponsesCount > 0) {
        throw createHttpError(
            `Cannot ${action} a request-question relation that still has active responses`,
            409
        );
    }
}

async function getRequestQuestions() {
    return requestQuestionQueryCache.getOrSet(REQUEST_QUESTION_LIST_CACHE_KEY, async () => {
        const requestQuestions =
            await requestQuestionRepository.findAllRequestQuestionsForAdmin();
        return requestQuestions.map(formatRequestQuestion);
    });
}

async function getRequestQuestionByPk(idSolicitud, idPregunta) {
    return requestQuestionQueryCache.getOrSet(
        getRequestQuestionDetailCacheKey(idSolicitud, idPregunta),
        async () => {
            const requestQuestion = await requestQuestionRepository.findRequestQuestionByPk(
                idSolicitud,
                idPregunta
            );

            if (!requestQuestion) {
                throw createHttpError('Request-question relation not found', 404);
            }

            return formatRequestQuestion(requestQuestion);
        }
    );
}

async function createRequestQuestion(requestQuestionData) {
    const requestedState =
        requestQuestionData.idEstado === undefined ||
        requestQuestionData.idEstado === null ||
        requestQuestionData.idEstado === ''
            ? 1
            : Number(requestQuestionData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError(
            'New request-question relations must start in active state',
            400
        );
    }

    const payload = {
        idSolicitud: Number(requestQuestionData.idSolicitud),
        idPregunta: Number(requestQuestionData.idPregunta),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [request, question] = await Promise.all([
        requestService.getRequestById(payload.idSolicitud),
        questionService.getQuestionById(payload.idPregunta)
    ]);
    ensureActiveRequestQuestionCanBeApplied({
        request,
        question,
        idEstado: payload.idEstado
    });

    const existingRequestQuestion =
        await requestQuestionRepository.findRequestQuestionByPk(
            payload.idSolicitud,
            payload.idPregunta
        );

    if (existingRequestQuestion) {
        throw createHttpError(
            'Request-question relation already exists. Update it if you need to reactivate it',
            409
        );
    }

    await requestQuestionRepository.createRequestQuestion(payload);
    invalidateRequestQuestionCache(payload.idSolicitud, payload.idPregunta);

    return getRequestQuestionByPk(payload.idSolicitud, payload.idPregunta);
}

async function updateRequestQuestion(idSolicitud, idPregunta, requestQuestionData) {
    const normalizedIdSolicitud = Number(idSolicitud);
    const normalizedIdPregunta = Number(idPregunta);
    const existingRequestQuestion = await getRequestQuestionByPk(
        normalizedIdSolicitud,
        normalizedIdPregunta
    );
    const payload = {
        idSolicitud: normalizedIdSolicitud,
        idPregunta: normalizedIdPregunta,
        idEstado: Number(requestQuestionData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    if (Number(payload.idEstado) === 1) {
        const [request, question] = await Promise.all([
            requestService.getRequestById(payload.idSolicitud),
            questionService.getQuestionById(payload.idPregunta)
        ]);

        ensureActiveRequestQuestionCanBeApplied({
            request,
            question,
            idEstado: payload.idEstado
        });
    } else if (Number(existingRequestQuestion.idEstado) === 1) {
        await ensureNoActiveResponses(payload.idSolicitud, payload.idPregunta, 'deactivate');
    }

    await requestQuestionRepository.updateRequestQuestion(payload);
    invalidateRequestQuestionCache(
        existingRequestQuestion.idSolicitud,
        existingRequestQuestion.idPregunta
    );

    return getRequestQuestionByPk(payload.idSolicitud, payload.idPregunta);
}

async function deleteRequestQuestion(idSolicitud, idPregunta) {
    const existingRequestQuestion = await getRequestQuestionByPk(idSolicitud, idPregunta);

    if (Number(existingRequestQuestion.idEstado) !== 1) {
        throw createHttpError('Request-question relation is already inactive', 409);
    }

    await ensureNoActiveResponses(idSolicitud, idPregunta, 'delete');
    await requestQuestionRepository.deleteRequestQuestion(idSolicitud, idPregunta);
    invalidateRequestQuestionCache(
        existingRequestQuestion.idSolicitud,
        existingRequestQuestion.idPregunta
    );
}

module.exports = {
    getRequestQuestions,
    getRequestQuestionByPk,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion
};
