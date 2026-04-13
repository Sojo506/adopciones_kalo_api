const catalogService = require('./catalogService');
const requestRepository = require('../repositories/requestRepository');
const requestTypeRepository = require('../repositories/requestTypeRepository');
const userRepository = require('../repositories/userRepository');
const MemoryCache = require('../utils/memoryCache');

const REQUEST_LIST_CACHE_KEY = 'request:list';
const REQUEST_DETAIL_CACHE_PREFIX = 'request:detail:';
const REQUEST_CACHE_TTL_MS = Number(process.env.REQUEST_CACHE_TTL_MS || 15000);
const requestQueryCache = new MemoryCache({
    defaultTtlMs: REQUEST_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getRequestDetailCacheKey(idSolicitud) {
    return `${REQUEST_DETAIL_CACHE_PREFIX}${String(idSolicitud).trim()}`;
}

function invalidateRequestCache(idSolicitud) {
    requestQueryCache.delete(REQUEST_LIST_CACHE_KEY);

    if (idSolicitud !== undefined && idSolicitud !== null) {
        requestQueryCache.delete(getRequestDetailCacheKey(idSolicitud));
        return;
    }

    requestQueryCache.clearByPrefix(REQUEST_DETAIL_CACHE_PREFIX);
}

function formatRequest(request) {
    return {
        idSolicitud: Number(request.ID_SOLICITUD),
        identificacion: request.IDENTIFICACION,
        solicitante: request.SOLICITANTE || null,
        idTipoSolicitud: Number(request.ID_TIPO_SOLICITUD),
        tipoSolicitud: request.TIPO_SOLICITUD || null,
        idEstado: Number(request.ID_ESTADO),
        estado: request.ESTADO_SOLICITUD || null
    };
}

function withDependencySummary(request, dependencySummary = {}) {
    return {
        ...request,
        activeResponses: Number(dependencySummary.activeResponses || 0),
        activeAdoptions: Number(dependencySummary.activeAdoptions || 0),
        activeFosterHomes: Number(dependencySummary.activeFosterHomes || 0)
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureUserExists(identificacion) {
    const user = await userRepository.findByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user;
}

async function ensureRequestTypeExists(idTipoSolicitud) {
    const requestType = await requestTypeRepository.findRequestTypeById(idTipoSolicitud);

    if (!requestType) {
        throw createHttpError('Request type not found', 404);
    }

    return requestType;
}

function joinDependencyLabels(labels) {
    if (labels.length <= 1) {
        return labels[0] || 'related records';
    }

    if (labels.length === 2) {
        return `${labels[0]} or ${labels[1]}`;
    }

    return `${labels.slice(0, -1).join(', ')}, or ${labels.at(-1)}`;
}

function createDependencyErrorMessage(action, dependencySummary) {
    const labels = [];

    if (dependencySummary.activeResponses > 0) {
        labels.push('responses');
    }

    if (dependencySummary.activeAdoptions > 0) {
        labels.push('adoptions');
    }

    if (dependencySummary.activeFosterHomes > 0) {
        labels.push('foster-home records');
    }

    return `Cannot ${action} a request that still has active ${joinDependencyLabels(labels)}`;
}

function hasBlockingDependencies(dependencySummary) {
    return (
        Number(dependencySummary.activeResponses || 0) > 0 ||
        Number(dependencySummary.activeAdoptions || 0) > 0 ||
        Number(dependencySummary.activeFosterHomes || 0) > 0
    );
}

async function ensureRequestCanRemainActive(user, requestType, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(user.ID_ESTADO) !== 1) {
        throw createHttpError('Cannot keep a request active under an inactive user', 409);
    }

    if (Number(requestType.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep a request active under an inactive request type',
            409
        );
    }
}

async function ensureRequestCanBeDisabled(existingRequest, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingRequest.idEstado) !== 1) {
        return;
    }

    const dependencySummary = await requestRepository.getActiveDependencySummaryByRequest(
        existingRequest.idSolicitud
    );

    if (hasBlockingDependencies(dependencySummary)) {
        throw createHttpError(
            createDependencyErrorMessage('deactivate', dependencySummary),
            409
        );
    }
}

async function ensureRequestCanBeDeleted(existingRequest) {
    if (Number(existingRequest.idEstado) !== 1) {
        throw createHttpError('Request is already inactive', 409);
    }

    const dependencySummary = await requestRepository.getActiveDependencySummaryByRequest(
        existingRequest.idSolicitud
    );

    if (hasBlockingDependencies(dependencySummary)) {
        throw createHttpError(createDependencyErrorMessage('delete', dependencySummary), 409);
    }
}

async function ensureRequestCoreFieldsCanBeChanged(existingRequest, payload) {
    const identificationChanged =
        String(existingRequest.identificacion) !== String(payload.identificacion);
    const requestTypeChanged =
        Number(existingRequest.idTipoSolicitud) !== Number(payload.idTipoSolicitud);

    if (!identificationChanged && !requestTypeChanged) {
        return;
    }

    const dependencySummary = await requestRepository.getActiveDependencySummaryByRequest(
        existingRequest.idSolicitud
    );

    if (!hasBlockingDependencies(dependencySummary)) {
        return;
    }

    throw createHttpError(
        'Cannot change the applicant or request type while the request has active responses, adoptions, or foster-home records',
        409
    );
}

async function getRequests() {
    return requestQueryCache.getOrSet(REQUEST_LIST_CACHE_KEY, async () => {
        const requests = await requestRepository.findAllRequestsForAdmin();
        return requests.map(formatRequest);
    });
}

async function getRequestById(idSolicitud) {
    return requestQueryCache.getOrSet(getRequestDetailCacheKey(idSolicitud), async () => {
        const request = await requestRepository.findRequestById(idSolicitud);

        if (!request) {
            throw createHttpError('Request not found', 404);
        }

        const dependencySummary = await requestRepository.getActiveDependencySummaryByRequest(
            idSolicitud
        );

        return withDependencySummary(formatRequest(request), dependencySummary);
    });
}

async function createRequest(requestData) {
    const payload = {
        identificacion: String(requestData.identificacion || '').trim(),
        idTipoSolicitud: Number(requestData.idTipoSolicitud),
        idEstado: Number(requestData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [user, requestType] = await Promise.all([
        ensureUserExists(payload.identificacion),
        ensureRequestTypeExists(payload.idTipoSolicitud)
    ]);
    await ensureRequestCanRemainActive(user, requestType, payload.idEstado);

    const result = await requestRepository.createRequest(payload);
    invalidateRequestCache(result.idSolicitud);

    return getRequestById(result.idSolicitud);
}

async function updateRequest(idSolicitud, requestData) {
    const existingRequest = await getRequestById(idSolicitud);
    const payload = {
        idSolicitud: Number(idSolicitud),
        identificacion: String(requestData.identificacion || '').trim(),
        idTipoSolicitud: Number(requestData.idTipoSolicitud),
        idEstado: Number(requestData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [user, requestType] = await Promise.all([
        ensureUserExists(payload.identificacion),
        ensureRequestTypeExists(payload.idTipoSolicitud)
    ]);
    await ensureRequestCoreFieldsCanBeChanged(existingRequest, payload);
    await ensureRequestCanRemainActive(user, requestType, payload.idEstado);
    await ensureRequestCanBeDisabled(existingRequest, payload.idEstado);

    await requestRepository.updateRequest(payload);
    invalidateRequestCache(payload.idSolicitud);

    return getRequestById(payload.idSolicitud);
}

async function deleteRequest(idSolicitud) {
    const existingRequest = await getRequestById(idSolicitud);

    await ensureRequestCanBeDeleted(existingRequest);
    await requestRepository.deleteRequest(idSolicitud);
    invalidateRequestCache(idSolicitud);
}

module.exports = {
    getRequests,
    getRequestById,
    createRequest,
    updateRequest,
    deleteRequest,
    invalidateRequestReadCaches: invalidateRequestCache
};
