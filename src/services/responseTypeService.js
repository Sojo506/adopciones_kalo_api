const catalogService = require('./catalogService');
const responseTypeRepository = require('../repositories/responseTypeRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const RESPONSE_TYPE_LIST_CACHE_KEY = 'response-type:list';
const RESPONSE_TYPE_DETAIL_CACHE_PREFIX = 'response-type:detail:';
const RESPONSE_TYPE_CACHE_TTL_MS = Number(process.env.RESPONSE_TYPE_CACHE_TTL_MS || 15000);
const responseTypeQueryCache = new MemoryCache({
    defaultTtlMs: RESPONSE_TYPE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeResponseTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getResponseTypeDetailCacheKey(idTipoRespuesta) {
    return `${RESPONSE_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoRespuesta).trim()}`;
}

function invalidateResponseTypeCache(idTipoRespuesta) {
    responseTypeQueryCache.delete(RESPONSE_TYPE_LIST_CACHE_KEY);

    if (idTipoRespuesta !== undefined && idTipoRespuesta !== null) {
        responseTypeQueryCache.delete(getResponseTypeDetailCacheKey(idTipoRespuesta));
        return;
    }

    responseTypeQueryCache.clearByPrefix(RESPONSE_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoRespuesta = null) {
    invalidateResponseTypeCache(idTipoRespuesta);
    catalogService.invalidateResponseTypesCache();
}

function formatResponseType(responseType) {
    return {
        idTipoRespuesta: responseType.ID_TIPO_RESPUESTA,
        nombre: responseType.NOMBRE,
        idEstado: responseType.ID_ESTADO,
        estado: responseType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureResponseTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeResponseTypeName(nombre);
    const responseTypes = await getResponseTypes();
    const duplicatedResponseType = responseTypes.find(
        (responseType) =>
            normalizeResponseTypeName(responseType.nombre) === normalizedName &&
            Number(responseType.idTipoRespuesta) !== Number(excludeId)
    );

    if (duplicatedResponseType) {
        throw createHttpError('Response type name already exists', 409);
    }
}

async function ensureResponseTypeCanBeDisabled(existingResponseType, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingResponseType.idEstado)) {
        return;
    }

    const activeQuestionsCount =
        await responseTypeRepository.countActiveQuestionsByResponseType(
            existingResponseType.idTipoRespuesta
        );

    if (activeQuestionsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a response type that still has active questions',
            409
        );
    }
}

async function ensureResponseTypeCanBeDeleted(existingResponseType) {
    if (isInactiveState(existingResponseType.idEstado)) {
        throw createHttpError('Response type is already inactive', 409);
    }

    const activeQuestionsCount =
        await responseTypeRepository.countActiveQuestionsByResponseType(
            existingResponseType.idTipoRespuesta
        );

    if (activeQuestionsCount > 0) {
        throw createHttpError(
            'Cannot delete a response type that still has active questions',
            409
        );
    }
}

async function getResponseTypes() {
    return responseTypeQueryCache.getOrSet(RESPONSE_TYPE_LIST_CACHE_KEY, async () => {
        const responseTypes = await responseTypeRepository.findAllResponseTypesForAdmin();
        return responseTypes.map(formatResponseType);
    });
}

async function getResponseTypeById(idTipoRespuesta) {
    return responseTypeQueryCache.getOrSet(
        getResponseTypeDetailCacheKey(idTipoRespuesta),
        async () => {
            const responseType = await responseTypeRepository.findResponseTypeById(
                idTipoRespuesta
            );

            if (!responseType) {
                throw createHttpError('Response type not found', 404);
            }

            return formatResponseType(responseType);
        }
    );
}

async function createResponseType(responseTypeData) {
    const payload = {
        nombre: String(responseTypeData.nombre || '').trim(),
        idEstado: Number(responseTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureResponseTypeNameIsAvailable(payload.nombre);

    const result = await responseTypeRepository.createResponseType(payload);
    invalidateRelatedCaches(result.idTipoRespuesta);

    return getResponseTypeById(result.idTipoRespuesta);
}

async function updateResponseType(idTipoRespuesta, responseTypeData) {
    const existingResponseType = await getResponseTypeById(idTipoRespuesta);
    const payload = {
        idTipoRespuesta: Number(idTipoRespuesta),
        nombre: String(responseTypeData.nombre || '').trim(),
        idEstado: Number(responseTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureResponseTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoRespuesta
    });
    await ensureResponseTypeCanBeDisabled(existingResponseType, payload.idEstado);

    await responseTypeRepository.updateResponseType(payload);
    invalidateRelatedCaches(payload.idTipoRespuesta);

    return getResponseTypeById(payload.idTipoRespuesta);
}

async function deleteResponseType(idTipoRespuesta) {
    const existingResponseType = await getResponseTypeById(idTipoRespuesta);

    await ensureResponseTypeCanBeDeleted(existingResponseType);
    await responseTypeRepository.deleteResponseType(idTipoRespuesta);
    invalidateRelatedCaches(idTipoRespuesta);
}

module.exports = {
    getResponseTypes,
    getResponseTypeById,
    createResponseType,
    updateResponseType,
    deleteResponseType
};
