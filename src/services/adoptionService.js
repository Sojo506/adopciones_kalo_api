const catalogService = require('./catalogService');
const dogService = require('./dogService');
const requestService = require('./requestService');
const userService = require('./userService');
const adoptionRepository = require('../repositories/adoptionRepository');
const MemoryCache = require('../utils/memoryCache');

const ADOPTION_LIST_CACHE_KEY = 'adoption:list';
const ADOPTION_DETAIL_CACHE_PREFIX = 'adoption:detail:';
const ADOPTION_CACHE_TTL_MS = Number(process.env.ADOPTION_CACHE_TTL_MS || 15000);
const ADOPTION_REQUEST_TYPE_NAME = 'Adopcion';
const ADOPTION_REQUEST_TYPE_FALLBACK_ID = 1;

const ACTIVE_STATE_ID = 1;
const PENDING_STATE_ID = 3;

const adoptionQueryCache = new MemoryCache({
    defaultTtlMs: ADOPTION_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCatalogName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeIdentification(value) {
    return String(value || '').trim();
}

function getAdoptionDetailCacheKey(idAdopcion) {
    return `${ADOPTION_DETAIL_CACHE_PREFIX}${String(idAdopcion).trim()}`;
}

function invalidateAdoptionCache(idAdopcion) {
    adoptionQueryCache.delete(ADOPTION_LIST_CACHE_KEY);

    if (idAdopcion !== undefined && idAdopcion !== null) {
        adoptionQueryCache.delete(getAdoptionDetailCacheKey(idAdopcion));
        return;
    }

    adoptionQueryCache.clearByPrefix(ADOPTION_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idAdopcion, requestIds = []) {
    invalidateAdoptionCache(idAdopcion);

    for (const requestId of requestIds) {
        if (requestId !== undefined && requestId !== null) {
            requestService.invalidateRequestReadCaches?.(requestId);
        }
    }
}

function serializeDateOnly(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
            return trimmedValue;
        }

        const parsedDate = new Date(trimmedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(parsedDate.getUTCDate()).padStart(2, '0')}`;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function parseDateValue(value, fieldLabel) {
    if (value === undefined || value === null || value === '') {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedDate;
}

function parseOptionalDateValue(value, fallbackValue = null) {
    if (value === undefined || value === null || value === '') {
        return fallbackValue;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError('Adoption date is invalid', 400);
    }

    return parsedDate;
}

function formatAdoption(adoption) {
    return {
        idAdopcion: Number(adoption.ID_ADOPCION),
        identificacion: String(adoption.IDENTIFICACION),
        adoptante: adoption.ADOPTANTE || null,
        idSolicitud: Number(adoption.ID_SOLICITUD),
        idPerrito: Number(adoption.ID_PERRITO),
        nombrePerrito: adoption.NOMBRE_PERRITO || null,
        fechaAdopcion: serializeDateOnly(adoption.FECHA_ADOPCION),
        idEstado: Number(adoption.ID_ESTADO),
        estado: adoption.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function getAdoptionRequestTypeId() {
    const requestTypes = await catalogService.getRequestTypes();
    const matchingRequestType = requestTypes.find(
        (requestType) =>
            normalizeCatalogName(requestType.nombre) ===
            normalizeCatalogName(ADOPTION_REQUEST_TYPE_NAME)
    );

    if (matchingRequestType) {
        return Number(matchingRequestType.idTipoSolicitud);
    }

    const fallbackRequestType = requestTypes.find(
        (requestType) =>
            Number(requestType.idTipoSolicitud) === ADOPTION_REQUEST_TYPE_FALLBACK_ID
    );

    if (fallbackRequestType) {
        return Number(fallbackRequestType.idTipoSolicitud);
    }

    throw createHttpError(
        `Request type "${ADOPTION_REQUEST_TYPE_NAME}" is not configured`,
        500
    );
}

async function ensureRequestCanBeUsedForAdoption(request) {
    const adoptionRequestTypeId = await getAdoptionRequestTypeId();
    const requestTypeMatches =
        Number(request.idTipoSolicitud) === Number(adoptionRequestTypeId) ||
        normalizeCatalogName(request.tipoSolicitud) ===
        normalizeCatalogName(ADOPTION_REQUEST_TYPE_NAME);

    if (!requestTypeMatches) {
        throw createHttpError(
            'The selected request is not an adoption request',
            409
        );
    }
}

function ensureRequestOwnershipMatchesAdopter(identificacion, request) {
    const normalizedRequestIdentification = normalizeIdentification(request.identificacion);
    const normalizedAdopterIdentification = normalizeIdentification(identificacion);

    if (normalizedRequestIdentification !== normalizedAdopterIdentification) {
        throw createHttpError(
            'The selected request does not belong to the selected adopter',
            409
        );
    }
}

function ensureAssignmentEntitiesAreActive({ adopter, dog, request }) {
    if (Number(adopter.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot assign an adoption to an inactive adopter',
            409
        );
    }

    if (Number(dog.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot assign an adoption to an inactive dog',
            409
        );
    }

    if (Number(request.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot assign an adoption to an inactive request',
            409
        );
    }
}

function ensureActiveAdoptionCanUseAssignments({ adopter, dog, request, nextState }) {
    if (Number(nextState) !== ACTIVE_STATE_ID) {
        return;
    }

    if (Number(adopter.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot keep an adoption active for an inactive adopter',
            409
        );
    }

    if (Number(dog.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot keep an adoption active for an inactive dog',
            409
        );
    }

    if (Number(request.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError(
            'Cannot keep an adoption active for an inactive request',
            409
        );
    }
}

async function ensureRequestIsAvailable(idSolicitud, { excludeId = null } = {}) {
    const existingAdoption = await adoptionRepository.findAdoptionByRequestId(idSolicitud, {
        excludeId
    });

    if (existingAdoption) {
        throw createHttpError(
            'The selected request is already assigned to another adoption',
            409
        );
    }
}

async function ensureDogIsAvailableForActiveAdoption(
    idPerrito,
    { excludeId = null } = {}
) {
    const existingAdoption = await adoptionRepository.findActiveAdoptionByDogId(idPerrito, {
        excludeId
    });

    if (existingAdoption) {
        throw createHttpError(
            'The selected dog already has an active adoption',
            409
        );
    }
}

async function ensureAdoptionCanBeDisabled(existingAdoption, nextState) {
    if (Number(nextState) === ACTIVE_STATE_ID) {
        return;
    }

    if (Number(existingAdoption.idEstado) !== ACTIVE_STATE_ID) {
        return;
    }

    const activeFollowUpsCount = await adoptionRepository.countActiveFollowUpsByAdoption(
        existingAdoption.idAdopcion
    );

    if (activeFollowUpsCount > 0) {
        throw createHttpError(
            'Cannot deactivate an adoption that still has active follow-ups',
            409
        );
    }
}

async function ensureAdoptionCanBeDeleted(existingAdoption) {
    if (Number(existingAdoption.idEstado) !== ACTIVE_STATE_ID) {
        throw createHttpError('Adoption is already inactive', 409);
    }

    const activeFollowUpsCount = await adoptionRepository.countActiveFollowUpsByAdoption(
        existingAdoption.idAdopcion
    );

    if (activeFollowUpsCount > 0) {
        throw createHttpError(
            'Cannot delete an adoption that still has active follow-ups',
            409
        );
    }
}

async function getAdoptions() {
    return adoptionQueryCache.getOrSet(ADOPTION_LIST_CACHE_KEY, async () => {
        const adoptions = await adoptionRepository.findAllAdoptions();
        return adoptions.map(formatAdoption);
    });
}

async function getAdoptionById(idAdopcion) {
    return adoptionQueryCache.getOrSet(getAdoptionDetailCacheKey(idAdopcion), async () => {
        const adoption = await adoptionRepository.findAdoptionById(idAdopcion);

        if (!adoption) {
            throw createHttpError('Adoption not found', 404);
        }

        return formatAdoption(adoption);
    });
}

async function createAdoption(adoptionData) {
    const requestedState =
        adoptionData.idEstado === undefined ||
            adoptionData.idEstado === null ||
            adoptionData.idEstado === ''
            ? ACTIVE_STATE_ID
            : Number(adoptionData.idEstado);

    const isNewAdoptionStateAllowed =
        requestedState === ACTIVE_STATE_ID || requestedState === PENDING_STATE_ID;

    if (!isNewAdoptionStateAllowed) {
        throw createHttpError(
            'New adoptions must start in active or pending state',
            400
        );
    }

    const payload = {
        identificacion: normalizeIdentification(adoptionData.identificacion),
        idPerrito: Number(adoptionData.idPerrito),
        idSolicitud: Number(adoptionData.idSolicitud),
        fechaAdopcion:
            requestedState === PENDING_STATE_ID
                ? parseOptionalDateValue(adoptionData.fechaAdopcion, new Date())
                : parseDateValue(adoptionData.fechaAdopcion, 'Adoption date'),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);

    const [adopter, dog, request] = await Promise.all([
        userService.getUserByIdentification(payload.identificacion),
        dogService.getDogById(payload.idPerrito),
        requestService.getRequestById(payload.idSolicitud)
    ]);

    await ensureRequestCanBeUsedForAdoption(request);
    ensureRequestOwnershipMatchesAdopter(payload.identificacion, request);
    ensureAssignmentEntitiesAreActive({ adopter, dog, request });
    ensureActiveAdoptionCanUseAssignments({
        adopter,
        dog,
        request,
        nextState: payload.idEstado
    });

    await ensureRequestIsAvailable(payload.idSolicitud);

    if (Number(payload.idEstado) === ACTIVE_STATE_ID) {
        await ensureDogIsAvailableForActiveAdoption(payload.idPerrito);
    }

    const result = await adoptionRepository.createAdoption(payload);
    invalidateRelatedCaches(result.idAdopcion, [payload.idSolicitud]);

    return getAdoptionById(result.idAdopcion);
}

async function updateAdoption(idAdopcion, adoptionData) {
    const normalizedIdAdopcion = Number(idAdopcion);
    const existingAdoption = await getAdoptionById(normalizedIdAdopcion);

    const payload = {
        idAdopcion: normalizedIdAdopcion,
        identificacion: normalizeIdentification(adoptionData.identificacion),
        idPerrito: Number(adoptionData.idPerrito),
        idSolicitud: Number(adoptionData.idSolicitud),
        fechaAdopcion:
            Number(adoptionData.idEstado) === PENDING_STATE_ID
                ? parseOptionalDateValue(
                    adoptionData.fechaAdopcion,
                    existingAdoption.fechaAdopcion
                        ? new Date(existingAdoption.fechaAdopcion)
                        : new Date()
                )
                : parseDateValue(adoptionData.fechaAdopcion, 'Adoption date'),
        idEstado: Number(adoptionData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    const [adopter, dog, request] = await Promise.all([
        userService.getUserByIdentification(payload.identificacion),
        dogService.getDogById(payload.idPerrito),
        requestService.getRequestById(payload.idSolicitud)
    ]);

    await ensureRequestCanBeUsedForAdoption(request);
    ensureRequestOwnershipMatchesAdopter(payload.identificacion, request);
    ensureAssignmentEntitiesAreActive({ adopter, dog, request });
    ensureActiveAdoptionCanUseAssignments({
        adopter,
        dog,
        request,
        nextState: payload.idEstado
    });

    await ensureRequestIsAvailable(payload.idSolicitud, {
        excludeId: payload.idAdopcion
    });

    await ensureAdoptionCanBeDisabled(existingAdoption, payload.idEstado);

    if (Number(payload.idEstado) === ACTIVE_STATE_ID) {
        await ensureDogIsAvailableForActiveAdoption(payload.idPerrito, {
            excludeId: payload.idAdopcion
        });
    }

    await adoptionRepository.updateAdoption(payload);
    invalidateRelatedCaches(payload.idAdopcion, [
        existingAdoption.idSolicitud,
        payload.idSolicitud
    ]);

    return getAdoptionById(payload.idAdopcion);
}

async function deleteAdoption(idAdopcion) {
    const normalizedIdAdopcion = Number(idAdopcion);
    const existingAdoption = await getAdoptionById(normalizedIdAdopcion);

    await ensureAdoptionCanBeDeleted(existingAdoption);
    await adoptionRepository.deleteAdoption(normalizedIdAdopcion);
    invalidateRelatedCaches(normalizedIdAdopcion, [existingAdoption.idSolicitud]);
}

module.exports = {
    getAdoptions,
    getAdoptionById,
    createAdoption,
    updateAdoption,
    deleteAdoption,
    invalidateAdoptionReadCaches: invalidateAdoptionCache
};