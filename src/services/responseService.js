const catalogService = require('./catalogService');
const questionService = require('./questionService');
const requestService = require('./requestService');
const MemoryCache = require('../utils/memoryCache');
const requestQuestionRepository = require('../repositories/requestQuestionRepository');
const responseRepository = require('../repositories/responseRepository');

const RESPONSE_LIST_CACHE_KEY = 'response:list';
const RESPONSE_DETAIL_CACHE_PREFIX = 'response:detail:';
const RESPONSE_CACHE_TTL_MS = Number(process.env.RESPONSE_CACHE_TTL_MS || 15000);
const responseQueryCache = new MemoryCache({
    defaultTtlMs: RESPONSE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getResponseDetailCacheKey(idRespuesta) {
    return `${RESPONSE_DETAIL_CACHE_PREFIX}${String(idRespuesta).trim()}`;
}

function invalidateResponseCache(idRespuesta) {
    responseQueryCache.delete(RESPONSE_LIST_CACHE_KEY);

    if (idRespuesta !== undefined && idRespuesta !== null) {
        responseQueryCache.delete(getResponseDetailCacheKey(idRespuesta));
        return;
    }

    responseQueryCache.clearByPrefix(RESPONSE_DETAIL_CACHE_PREFIX);
}

function formatResponse(response) {
    return {
        idRespuesta: Number(response.ID_RESPUESTA),
        idSolicitud: Number(response.ID_SOLICITUD),
        identificacion: response.IDENTIFICACION || null,
        solicitante: response.SOLICITANTE || null,
        idTipoSolicitud:
            response.ID_TIPO_SOLICITUD === null || response.ID_TIPO_SOLICITUD === undefined
                ? null
                : Number(response.ID_TIPO_SOLICITUD),
        tipoSolicitud: response.TIPO_SOLICITUD || null,
        idPregunta: Number(response.ID_PREGUNTA),
        pregunta: response.PREGUNTA || null,
        idTipoRespuesta:
            response.ID_TIPO_RESPUESTA === null || response.ID_TIPO_RESPUESTA === undefined
                ? null
                : Number(response.ID_TIPO_RESPUESTA),
        tipoRespuesta: response.TIPO_RESPUESTA || null,
        respuesta: response.RESPUESTA || '',
        idEstado: Number(response.ID_ESTADO),
        estado: response.ESTADO_RESPUESTA || response.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureRequestQuestionRelationExists(request, idPregunta) {
    const requestQuestion = await requestQuestionRepository.findRequestQuestionByPk(
        request.idTipoSolicitud,
        idPregunta
    );

    if (!requestQuestion) {
        throw createHttpError(
            'The selected question is not assigned to the selected request type',
            409
        );
    }

    return requestQuestion;
}

function ensureRequestQuestionRelationIsActive(requestQuestion) {
    if (Number(requestQuestion.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot capture or update a response for an inactive request-type-question relation',
            409
        );
    }
}

function ensureResponseCanRemainActive({ request, question, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(request.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a response active under an inactive request',
            409
        );
    }

    if (Number(question.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a response active under an inactive question',
            409
        );
    }
}

async function ensureResponsePairIsAvailable(
    idSolicitud,
    idPregunta,
    { excludeId = null } = {}
) {
    const existingResponse = await responseRepository.findResponseByRequestQuestion(
        idSolicitud,
        idPregunta,
        { excludeId }
    );

    if (existingResponse) {
        throw createHttpError(
            'A response already exists for the selected request and question',
            409
        );
    }
}

async function getResponses() {
    return responseQueryCache.getOrSet(RESPONSE_LIST_CACHE_KEY, async () => {
        const responses = await responseRepository.findAllResponsesForAdmin();
        return responses.map(formatResponse);
    });
}

async function getResponseById(idRespuesta) {
    return responseQueryCache.getOrSet(getResponseDetailCacheKey(idRespuesta), async () => {
        const response = await responseRepository.findResponseById(idRespuesta);

        if (!response) {
            throw createHttpError('Response not found', 404);
        }

        return formatResponse(response);
    });
}

async function createResponse(responseData) {
    const payload = {
        idSolicitud: Number(responseData.idSolicitud),
        idPregunta: Number(responseData.idPregunta),
        respuesta: String(responseData.respuesta || '').trim(),
        idEstado: Number(responseData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [request, question] = await Promise.all([
        requestService.getRequestById(payload.idSolicitud),
        questionService.getQuestionById(payload.idPregunta)
    ]);
    const requestQuestion = await ensureRequestQuestionRelationExists(
        request,
        payload.idPregunta
    );

    ensureRequestQuestionRelationIsActive(requestQuestion);
    ensureResponseCanRemainActive({
        request,
        question,
        nextState: payload.idEstado
    });
    await ensureResponsePairIsAvailable(payload.idSolicitud, payload.idPregunta);

    const result = await responseRepository.createResponse(payload);
    invalidateResponseCache(result.idRespuesta);

    return getResponseById(result.idRespuesta);
}

async function updateResponse(idRespuesta, responseData) {
    const existingResponse = await getResponseById(idRespuesta);
    const payload = {
        idRespuesta: Number(idRespuesta),
        idSolicitud: Number(responseData.idSolicitud),
        idPregunta: Number(responseData.idPregunta),
        respuesta: String(responseData.respuesta || '').trim(),
        idEstado: Number(responseData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [request, question] = await Promise.all([
        requestService.getRequestById(payload.idSolicitud),
        questionService.getQuestionById(payload.idPregunta)
    ]);
    const requestQuestion = await ensureRequestQuestionRelationExists(
        request,
        payload.idPregunta
    );

    ensureRequestQuestionRelationIsActive(requestQuestion);
    ensureResponseCanRemainActive({
        request,
        question,
        nextState: payload.idEstado
    });
    await ensureResponsePairIsAvailable(payload.idSolicitud, payload.idPregunta, {
        excludeId: payload.idRespuesta
    });

    await responseRepository.updateResponse(payload);
    invalidateResponseCache(existingResponse.idRespuesta);

    return getResponseById(payload.idRespuesta);
}

async function deleteResponse(idRespuesta) {
    const existingResponse = await getResponseById(idRespuesta);

    if (Number(existingResponse.idEstado) !== 1) {
        throw createHttpError('Response is already inactive', 409);
    }

    await responseRepository.deleteResponse(idRespuesta);
    invalidateResponseCache(idRespuesta);
}

module.exports = {
    getResponses,
    getResponseById,
    createResponse,
    updateResponse,
    deleteResponse
};
