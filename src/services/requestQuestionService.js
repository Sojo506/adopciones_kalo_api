const catalogService = require('./catalogService');
const questionService = require('./questionService');
const requestQuestionRepository = require('../repositories/requestQuestionRepository');
const requestTypeRepository = require('../repositories/requestTypeRepository');
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

function normalizeRequestQuestionKey(idTipoSolicitud, idPregunta) {
    return `${String(idTipoSolicitud).trim()}:${String(idPregunta).trim()}`;
}

function getRequestQuestionDetailCacheKey(idTipoSolicitud, idPregunta) {
    return `${REQUEST_QUESTION_DETAIL_CACHE_PREFIX}${normalizeRequestQuestionKey(idTipoSolicitud, idPregunta)}`;
}

function invalidateRequestQuestionCache(idTipoSolicitud, idPregunta) {
    requestQuestionQueryCache.delete(REQUEST_QUESTION_LIST_CACHE_KEY);

    if (
        idTipoSolicitud !== undefined &&
        idTipoSolicitud !== null &&
        idPregunta !== undefined &&
        idPregunta !== null
    ) {
        requestQuestionQueryCache.delete(
            getRequestQuestionDetailCacheKey(idTipoSolicitud, idPregunta)
        );
        return;
    }

    requestQuestionQueryCache.clearByPrefix(REQUEST_QUESTION_DETAIL_CACHE_PREFIX);
}

function formatRequestQuestion(requestQuestion) {
    return {
        idTipoSolicitud: Number(requestQuestion.ID_TIPO_SOLICITUD),
        tipoSolicitud: requestQuestion.TIPO_SOLICITUD || null,
        idPregunta: Number(requestQuestion.ID_PREGUNTA),
        pregunta: requestQuestion.PREGUNTA || null,
        idTipoRespuesta: Number(requestQuestion.ID_TIPO_RESPUESTA),
        tipoRespuesta: requestQuestion.TIPO_RESPUESTA || null,
        idEstado: Number(requestQuestion.ID_ESTADO),
        estado: requestQuestion.ESTADO_RELACION || requestQuestion.ESTADO || null,
        idEstadoPregunta:
            requestQuestion.ID_ESTADO_PREGUNTA === undefined ||
            requestQuestion.ID_ESTADO_PREGUNTA === null
                ? null
                : Number(requestQuestion.ID_ESTADO_PREGUNTA),
        estadoPregunta: requestQuestion.ESTADO_PREGUNTA || null,
        idEstadoTipoSolicitud:
            requestQuestion.ID_ESTADO_TIPO_SOLICITUD === undefined ||
            requestQuestion.ID_ESTADO_TIPO_SOLICITUD === null
                ? null
                : Number(requestQuestion.ID_ESTADO_TIPO_SOLICITUD),
        estadoTipoSolicitud: requestQuestion.ESTADO_TIPO_SOLICITUD || null
    };
}

function formatActiveQuestionByRequestType(question) {
    return {
        idTipoSolicitud: Number(question.ID_TIPO_SOLICITUD),
        idPregunta: Number(question.ID_PREGUNTA),
        pregunta: question.PREGUNTA || null,
        idTipoRespuesta:
            question.ID_TIPO_RESPUESTA === undefined || question.ID_TIPO_RESPUESTA === null
                ? null
                : Number(question.ID_TIPO_RESPUESTA),
        tipoRespuesta: question.TIPO_RESPUESTA || null,
        idEstado: Number(question.ID_ESTADO),
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

function ensureActiveRequestQuestionCanBeApplied({ requestType, question, idEstado }) {
    if (Number(idEstado) !== 1) {
        return;
    }

    if (Number(requestType.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep a request-type-question relation active for an inactive request type',
            409
        );
    }

    if (Number(question.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a request-type-question relation active for an inactive question',
            409
        );
    }
}

async function ensureRequestTypeExists(idTipoSolicitud) {
    const requestType = await requestTypeRepository.findRequestTypeById(idTipoSolicitud);

    if (!requestType) {
        throw createHttpError('Request type not found', 404);
    }

    return requestType;
}

async function ensureNoActiveResponses(idTipoSolicitud, idPregunta, action) {
    const activeResponsesCount =
        await requestQuestionRepository.countActiveResponsesByAssignment(
            idTipoSolicitud,
            idPregunta
        );

    if (activeResponsesCount > 0) {
        throw createHttpError(
            `Cannot ${action} a request-type-question relation that still has active responses`,
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

async function getActiveQuestionsByRequestType(idTipoSolicitud) {
    const normalizedIdTipoSolicitud = Number(idTipoSolicitud);
    const requestType = await ensureRequestTypeExists(normalizedIdTipoSolicitud);

    if (Number(requestType.ID_ESTADO) !== 1) {
        return [];
    }

    const questions = await requestQuestionRepository.findActiveQuestionsByRequestType(
        normalizedIdTipoSolicitud
    );

    return questions.map(formatActiveQuestionByRequestType);
}

async function getRequestQuestionByPk(idTipoSolicitud, idPregunta) {
    return requestQuestionQueryCache.getOrSet(
        getRequestQuestionDetailCacheKey(idTipoSolicitud, idPregunta),
        async () => {
            const requestQuestion = await requestQuestionRepository.findRequestQuestionByPk(
                idTipoSolicitud,
                idPregunta
            );

            if (!requestQuestion) {
                throw createHttpError('Request-type-question relation not found', 404);
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
            'New request-type-question relations must start in active state',
            400
        );
    }

    const payload = {
        idTipoSolicitud: Number(requestQuestionData.idTipoSolicitud),
        idPregunta: Number(requestQuestionData.idPregunta),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [requestType, question] = await Promise.all([
        ensureRequestTypeExists(payload.idTipoSolicitud),
        questionService.getQuestionById(payload.idPregunta)
    ]);
    ensureActiveRequestQuestionCanBeApplied({
        requestType,
        question,
        idEstado: payload.idEstado
    });

    const existingRequestQuestion =
        await requestQuestionRepository.findRequestQuestionByPk(
            payload.idTipoSolicitud,
            payload.idPregunta
        );

    if (existingRequestQuestion) {
        throw createHttpError(
            'Request-type-question relation already exists. Update it if you need to reactivate it',
            409
        );
    }

    await requestQuestionRepository.createRequestQuestion(payload);
    invalidateRequestQuestionCache(payload.idTipoSolicitud, payload.idPregunta);

    return getRequestQuestionByPk(payload.idTipoSolicitud, payload.idPregunta);
}

async function updateRequestQuestion(idTipoSolicitud, idPregunta, requestQuestionData) {
    const normalizedIdTipoSolicitud = Number(idTipoSolicitud);
    const normalizedIdPregunta = Number(idPregunta);
    const existingRequestQuestion = await getRequestQuestionByPk(
        normalizedIdTipoSolicitud,
        normalizedIdPregunta
    );
    const payload = {
        idTipoSolicitud: normalizedIdTipoSolicitud,
        idPregunta: normalizedIdPregunta,
        idEstado: Number(requestQuestionData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    if (Number(payload.idEstado) === 1) {
        const [requestType, question] = await Promise.all([
            ensureRequestTypeExists(payload.idTipoSolicitud),
            questionService.getQuestionById(payload.idPregunta)
        ]);

        ensureActiveRequestQuestionCanBeApplied({
            requestType,
            question,
            idEstado: payload.idEstado
        });
    } else if (Number(existingRequestQuestion.idEstado) === 1) {
        await ensureNoActiveResponses(
            payload.idTipoSolicitud,
            payload.idPregunta,
            'deactivate'
        );
    }

    await requestQuestionRepository.updateRequestQuestion(payload);
    invalidateRequestQuestionCache(
        existingRequestQuestion.idTipoSolicitud,
        existingRequestQuestion.idPregunta
    );

    return getRequestQuestionByPk(payload.idTipoSolicitud, payload.idPregunta);
}

async function deleteRequestQuestion(idTipoSolicitud, idPregunta) {
    const existingRequestQuestion = await getRequestQuestionByPk(idTipoSolicitud, idPregunta);

    if (Number(existingRequestQuestion.idEstado) !== 1) {
        throw createHttpError('Request-type-question relation is already inactive', 409);
    }

    await ensureNoActiveResponses(idTipoSolicitud, idPregunta, 'delete');
    await requestQuestionRepository.deleteRequestQuestion(idTipoSolicitud, idPregunta);
    invalidateRequestQuestionCache(
        existingRequestQuestion.idTipoSolicitud,
        existingRequestQuestion.idPregunta
    );
}

module.exports = {
    getRequestQuestions,
    getActiveQuestionsByRequestType,
    getRequestQuestionByPk,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion
};
