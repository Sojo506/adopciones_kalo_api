const catalogService = require('./catalogService');
const requestTypeRepository = require('../repositories/requestTypeRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const REQUEST_TYPE_LIST_CACHE_KEY = 'request-type:list';
const REQUEST_TYPE_DETAIL_CACHE_PREFIX = 'request-type:detail:';
const REQUEST_TYPE_CACHE_TTL_MS = Number(process.env.REQUEST_TYPE_CACHE_TTL_MS || 15000);
const requestTypeQueryCache = new MemoryCache({
    defaultTtlMs: REQUEST_TYPE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeRequestTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getRequestTypeDetailCacheKey(idTipoSolicitud) {
    return `${REQUEST_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoSolicitud).trim()}`;
}

function invalidateRequestTypeCache(idTipoSolicitud) {
    requestTypeQueryCache.delete(REQUEST_TYPE_LIST_CACHE_KEY);

    if (idTipoSolicitud !== undefined && idTipoSolicitud !== null) {
        requestTypeQueryCache.delete(getRequestTypeDetailCacheKey(idTipoSolicitud));
        return;
    }

    requestTypeQueryCache.clearByPrefix(REQUEST_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoSolicitud = null) {
    invalidateRequestTypeCache(idTipoSolicitud);
    catalogService.invalidateRequestTypesCache();
}

function formatRequestType(requestType) {
    return {
        idTipoSolicitud: requestType.ID_TIPO_SOLICITUD,
        nombre: requestType.NOMBRE,
        idEstado: requestType.ID_ESTADO,
        estado: requestType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureRequestTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeRequestTypeName(nombre);
    const requestTypes = await getRequestTypes();
    const duplicatedRequestType = requestTypes.find(
        (requestType) =>
            normalizeRequestTypeName(requestType.nombre) === normalizedName &&
            Number(requestType.idTipoSolicitud) !== Number(excludeId)
    );

    if (duplicatedRequestType) {
        throw createHttpError('Request type name already exists', 409);
    }
}

async function ensureRequestTypeCanBeDisabled(existingRequestType, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingRequestType.idEstado)) {
        return;
    }

    const activeRequestsCount = await requestTypeRepository.countActiveRequestsByType(
        existingRequestType.idTipoSolicitud
    );

    if (activeRequestsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a request type that still has active requests',
            409
        );
    }
}

async function ensureRequestTypeCanBeDeleted(existingRequestType) {
    if (isInactiveState(existingRequestType.idEstado)) {
        throw createHttpError('Request type is already inactive', 409);
    }

    const activeRequestsCount = await requestTypeRepository.countActiveRequestsByType(
        existingRequestType.idTipoSolicitud
    );

    if (activeRequestsCount > 0) {
        throw createHttpError(
            'Cannot delete a request type that still has active requests',
            409
        );
    }
}

async function getRequestTypes() {
    return requestTypeQueryCache.getOrSet(REQUEST_TYPE_LIST_CACHE_KEY, async () => {
        const requestTypes = await requestTypeRepository.findAllRequestTypesForAdmin();
        return requestTypes.map(formatRequestType);
    });
}

async function getRequestTypeById(idTipoSolicitud) {
    return requestTypeQueryCache.getOrSet(
        getRequestTypeDetailCacheKey(idTipoSolicitud),
        async () => {
            const requestType = await requestTypeRepository.findRequestTypeById(
                idTipoSolicitud
            );

            if (!requestType) {
                throw createHttpError('Request type not found', 404);
            }

            return formatRequestType(requestType);
        }
    );
}

async function createRequestType(requestTypeData) {
    const payload = {
        nombre: String(requestTypeData.nombre || '').trim(),
        idEstado: Number(requestTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureRequestTypeNameIsAvailable(payload.nombre);

    const result = await requestTypeRepository.createRequestType(payload);
    invalidateRelatedCaches(result.idTipoSolicitud);

    return getRequestTypeById(result.idTipoSolicitud);
}

async function updateRequestType(idTipoSolicitud, requestTypeData) {
    const existingRequestType = await getRequestTypeById(idTipoSolicitud);
    const payload = {
        idTipoSolicitud: Number(idTipoSolicitud),
        nombre: String(requestTypeData.nombre || '').trim(),
        idEstado: Number(requestTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureRequestTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoSolicitud
    });
    await ensureRequestTypeCanBeDisabled(existingRequestType, payload.idEstado);

    await requestTypeRepository.updateRequestType(payload);
    invalidateRelatedCaches(payload.idTipoSolicitud);

    return getRequestTypeById(payload.idTipoSolicitud);
}

async function deleteRequestType(idTipoSolicitud) {
    const existingRequestType = await getRequestTypeById(idTipoSolicitud);

    await ensureRequestTypeCanBeDeleted(existingRequestType);
    await requestTypeRepository.deleteRequestType(idTipoSolicitud);
    invalidateRelatedCaches(idTipoSolicitud);
}

module.exports = {
    getRequestTypes,
    getRequestTypeById,
    createRequestType,
    updateRequestType,
    deleteRequestType
};
