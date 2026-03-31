const catalogService = require('./catalogService');
const trackingTypeRepository = require('../repositories/trackingTypeRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const TRACKING_TYPE_LIST_CACHE_KEY = 'tracking-type:list';
const TRACKING_TYPE_DETAIL_CACHE_PREFIX = 'tracking-type:detail:';
const TRACKING_TYPE_CACHE_TTL_MS = Number(process.env.TRACKING_TYPE_CACHE_TTL_MS || 15000);
const trackingTypeQueryCache = new MemoryCache({
    defaultTtlMs: TRACKING_TYPE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeTrackingTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getTrackingTypeDetailCacheKey(idTipoSeguimiento) {
    return `${TRACKING_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoSeguimiento).trim()}`;
}

function invalidateTrackingTypeCache(idTipoSeguimiento) {
    trackingTypeQueryCache.delete(TRACKING_TYPE_LIST_CACHE_KEY);

    if (idTipoSeguimiento !== undefined && idTipoSeguimiento !== null) {
        trackingTypeQueryCache.delete(getTrackingTypeDetailCacheKey(idTipoSeguimiento));
        return;
    }

    trackingTypeQueryCache.clearByPrefix(TRACKING_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoSeguimiento = null) {
    invalidateTrackingTypeCache(idTipoSeguimiento);
    catalogService.invalidateTrackingTypesCache();
}

function formatTrackingType(trackingType) {
    return {
        idTipoSeguimiento: trackingType.ID_TIPO_SEGUIMIENTO,
        nombre: trackingType.NOMBRE,
        idEstado: trackingType.ID_ESTADO,
        estado: trackingType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureTrackingTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeTrackingTypeName(nombre);
    const trackingTypes = await getTrackingTypes();
    const duplicatedTrackingType = trackingTypes.find(
        (trackingType) =>
            normalizeTrackingTypeName(trackingType.nombre) === normalizedName &&
            Number(trackingType.idTipoSeguimiento) !== Number(excludeId)
    );

    if (duplicatedTrackingType) {
        throw createHttpError('Tracking type name already exists', 409);
    }
}

async function ensureTrackingTypeCanBeDisabled(existingTrackingType, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingTrackingType.idEstado)) {
        return;
    }

    const activeFollowUpsCount = await trackingTypeRepository.countActiveFollowUpsByType(
        existingTrackingType.idTipoSeguimiento
    );

    if (activeFollowUpsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a tracking type that still has active follow-ups',
            409
        );
    }
}

async function ensureTrackingTypeCanBeDeleted(existingTrackingType) {
    if (isInactiveState(existingTrackingType.idEstado)) {
        throw createHttpError('Tracking type is already inactive', 409);
    }

    const activeFollowUpsCount = await trackingTypeRepository.countActiveFollowUpsByType(
        existingTrackingType.idTipoSeguimiento
    );

    if (activeFollowUpsCount > 0) {
        throw createHttpError(
            'Cannot delete a tracking type that still has active follow-ups',
            409
        );
    }
}

async function getTrackingTypes() {
    return trackingTypeQueryCache.getOrSet(TRACKING_TYPE_LIST_CACHE_KEY, async () => {
        const trackingTypes = await trackingTypeRepository.findAllTrackingTypesForAdmin();
        return trackingTypes.map(formatTrackingType);
    });
}

async function getTrackingTypeById(idTipoSeguimiento) {
    return trackingTypeQueryCache.getOrSet(
        getTrackingTypeDetailCacheKey(idTipoSeguimiento),
        async () => {
            const trackingType = await trackingTypeRepository.findTrackingTypeById(
                idTipoSeguimiento
            );

            if (!trackingType) {
                throw createHttpError('Tracking type not found', 404);
            }

            return formatTrackingType(trackingType);
        }
    );
}

async function createTrackingType(trackingTypeData) {
    const payload = {
        nombre: String(trackingTypeData.nombre || '').trim(),
        idEstado: Number(trackingTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureTrackingTypeNameIsAvailable(payload.nombre);

    const result = await trackingTypeRepository.createTrackingType(payload);
    invalidateRelatedCaches(result.idTipoSeguimiento);

    return getTrackingTypeById(result.idTipoSeguimiento);
}

async function updateTrackingType(idTipoSeguimiento, trackingTypeData) {
    const existingTrackingType = await getTrackingTypeById(idTipoSeguimiento);
    const payload = {
        idTipoSeguimiento: Number(idTipoSeguimiento),
        nombre: String(trackingTypeData.nombre || '').trim(),
        idEstado: Number(trackingTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureTrackingTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoSeguimiento
    });
    await ensureTrackingTypeCanBeDisabled(existingTrackingType, payload.idEstado);

    await trackingTypeRepository.updateTrackingType(payload);
    invalidateRelatedCaches(payload.idTipoSeguimiento);

    return getTrackingTypeById(payload.idTipoSeguimiento);
}

async function deleteTrackingType(idTipoSeguimiento) {
    const existingTrackingType = await getTrackingTypeById(idTipoSeguimiento);

    await ensureTrackingTypeCanBeDeleted(existingTrackingType);
    await trackingTypeRepository.deleteTrackingType(idTipoSeguimiento);
    invalidateRelatedCaches(idTipoSeguimiento);
}

module.exports = {
    getTrackingTypes,
    getTrackingTypeById,
    createTrackingType,
    updateTrackingType,
    deleteTrackingType,
    invalidateTrackingTypeReadCaches: invalidateTrackingTypeCache
};
