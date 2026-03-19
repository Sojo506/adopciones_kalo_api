const adoptionService = require('./adoptionService');
const catalogService = require('./catalogService');
const followUpRepository = require('../repositories/followUpRepository');
const trackingTypeService = require('./trackingTypeService');
const MemoryCache = require('../utils/memoryCache');

const FOLLOW_UP_LIST_CACHE_KEY = 'follow-up:list';
const FOLLOW_UP_DETAIL_CACHE_PREFIX = 'follow-up:detail:';
const FOLLOW_UP_CACHE_TTL_MS = Number(process.env.FOLLOW_UP_CACHE_TTL_MS || 15000);
const followUpQueryCache = new MemoryCache({
    defaultTtlMs: FOLLOW_UP_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getFollowUpDetailCacheKey(idSeguimiento) {
    return `${FOLLOW_UP_DETAIL_CACHE_PREFIX}${String(idSeguimiento).trim()}`;
}

function invalidateFollowUpCache(idSeguimiento) {
    followUpQueryCache.delete(FOLLOW_UP_LIST_CACHE_KEY);

    if (idSeguimiento !== undefined && idSeguimiento !== null) {
        followUpQueryCache.delete(getFollowUpDetailCacheKey(idSeguimiento));
        return;
    }

    followUpQueryCache.clearByPrefix(FOLLOW_UP_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(
    idSeguimiento,
    adoptionIds = [],
    trackingTypeIds = []
) {
    invalidateFollowUpCache(idSeguimiento);

    for (const adoptionId of adoptionIds) {
        if (adoptionId !== undefined && adoptionId !== null) {
            adoptionService.invalidateAdoptionReadCaches?.(adoptionId);
        }
    }

    for (const trackingTypeId of trackingTypeIds) {
        if (trackingTypeId !== undefined && trackingTypeId !== null) {
            trackingTypeService.invalidateTrackingTypeReadCaches?.(trackingTypeId);
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

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
}

function toComparableDate(value, fieldLabel) {
    const serializedDate = serializeDateOnly(value);

    if (!serializedDate) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return new Date(`${serializedDate}T00:00:00.000Z`);
}

function ensureValidDateRange(fechaInicio, fechaFin) {
    const startDate = toComparableDate(fechaInicio, 'Start date');
    const endDate = toComparableDate(fechaFin, 'End date');

    if (endDate.getTime() < startDate.getTime()) {
        throw createHttpError(
            'Follow-up end date cannot be earlier than start date',
            409
        );
    }
}

function ensureDatesAreNotBeforeAdoption(adoption, fechaInicio, fechaFin) {
    const adoptionDate = toComparableDate(adoption.fechaAdopcion, 'Adoption date');
    const startDate = toComparableDate(fechaInicio, 'Start date');
    const endDate = toComparableDate(fechaFin, 'End date');

    if (startDate.getTime() < adoptionDate.getTime()) {
        throw createHttpError(
            'Follow-up start date cannot be earlier than the adoption date',
            409
        );
    }

    if (endDate.getTime() < adoptionDate.getTime()) {
        throw createHttpError(
            'Follow-up end date cannot be earlier than the adoption date',
            409
        );
    }
}

function formatFollowUp(followUp) {
    return {
        idSeguimiento: Number(followUp.ID_SEGUIMIENTO),
        idAdopcion: Number(followUp.ID_ADOPCION),
        identificacion: followUp.IDENTIFICACION ? String(followUp.IDENTIFICACION) : null,
        adoptante: followUp.ADOPTANTE || null,
        idPerrito:
            followUp.ID_PERRITO === null || followUp.ID_PERRITO === undefined
                ? null
                : Number(followUp.ID_PERRITO),
        nombrePerrito: followUp.NOMBRE_PERRITO || null,
        idTipoSeguimiento: Number(followUp.ID_TIPO_SEGUIMIENTO),
        tipoSeguimiento: followUp.TIPO_SEGUIMIENTO || null,
        fechaInicio: serializeDateOnly(followUp.FECHA_INICIO),
        fechaFin: serializeDateOnly(followUp.FECHA_FIN),
        comentarios: followUp.COMENTARIOS || '',
        idEstado: Number(followUp.ID_ESTADO),
        estado: followUp.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

function ensureActiveFollowUpCanUseAssignments({ adoption, trackingType, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(adoption.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a follow-up active under an inactive adoption',
            409
        );
    }

    if (Number(trackingType.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a follow-up active under an inactive tracking type',
            409
        );
    }
}

async function ensureFollowUpCanBeDisabled(existingFollowUp, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingFollowUp.idEstado) !== 1) {
        return;
    }

    const activeEvidencesCount =
        await followUpRepository.countActiveEvidencesByFollowUp(existingFollowUp.idSeguimiento);

    if (activeEvidencesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a follow-up that still has active evidences',
            409
        );
    }
}

async function ensureStructuralChangesAreAllowed(existingFollowUp, payload) {
    const activeEvidencesCount =
        await followUpRepository.countActiveEvidencesByFollowUp(existingFollowUp.idSeguimiento);

    if (activeEvidencesCount === 0) {
        return;
    }

    const adoptionChanged =
        Number(existingFollowUp.idAdopcion) !== Number(payload.idAdopcion);
    const trackingTypeChanged =
        Number(existingFollowUp.idTipoSeguimiento) !== Number(payload.idTipoSeguimiento);
    const startDateChanged =
        serializeDateOnly(existingFollowUp.fechaInicio) !==
        serializeDateOnly(payload.fechaInicio);
    const endDateChanged =
        serializeDateOnly(existingFollowUp.fechaFin) !== serializeDateOnly(payload.fechaFin);

    if (adoptionChanged || trackingTypeChanged || startDateChanged || endDateChanged) {
        throw createHttpError(
            'Cannot change adoption, tracking type or schedule for a follow-up that already has active evidences',
            409
        );
    }
}

async function ensureFollowUpCanBeDeleted(existingFollowUp) {
    if (Number(existingFollowUp.idEstado) !== 1) {
        throw createHttpError('Follow-up is already inactive', 409);
    }

    const activeEvidencesCount =
        await followUpRepository.countActiveEvidencesByFollowUp(existingFollowUp.idSeguimiento);

    if (activeEvidencesCount > 0) {
        throw createHttpError(
            'Cannot delete a follow-up that still has active evidences',
            409
        );
    }
}

async function getFollowUps() {
    return followUpQueryCache.getOrSet(FOLLOW_UP_LIST_CACHE_KEY, async () => {
        const followUps = await followUpRepository.findAllFollowUpsForAdmin();
        return followUps.map(formatFollowUp);
    });
}

async function getFollowUpById(idSeguimiento) {
    return followUpQueryCache.getOrSet(getFollowUpDetailCacheKey(idSeguimiento), async () => {
        const followUp = await followUpRepository.findFollowUpById(idSeguimiento);

        if (!followUp) {
            throw createHttpError('Follow-up not found', 404);
        }

        return formatFollowUp(followUp);
    });
}

async function createFollowUp(followUpData) {
    const requestedState =
        followUpData.idEstado === undefined ||
        followUpData.idEstado === null ||
        followUpData.idEstado === ''
            ? 1
            : Number(followUpData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New follow-ups must start in active state', 400);
    }

    const payload = {
        idAdopcion: Number(followUpData.idAdopcion),
        idTipoSeguimiento: Number(followUpData.idTipoSeguimiento),
        fechaInicio: parseDateValue(followUpData.fechaInicio, 'Start date'),
        fechaFin: parseDateValue(followUpData.fechaFin, 'End date'),
        comentarios: normalizeOptionalText(followUpData.comentarios),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [adoption, trackingType] = await Promise.all([
        adoptionService.getAdoptionById(payload.idAdopcion),
        trackingTypeService.getTrackingTypeById(payload.idTipoSeguimiento)
    ]);

    ensureValidDateRange(payload.fechaInicio, payload.fechaFin);
    ensureDatesAreNotBeforeAdoption(adoption, payload.fechaInicio, payload.fechaFin);
    ensureActiveFollowUpCanUseAssignments({
        adoption,
        trackingType,
        nextState: payload.idEstado
    });

    const result = await followUpRepository.createFollowUp(payload);
    invalidateRelatedCaches(
        result.idSeguimiento,
        [payload.idAdopcion],
        [payload.idTipoSeguimiento]
    );

    return getFollowUpById(result.idSeguimiento);
}

async function updateFollowUp(idSeguimiento, followUpData) {
    const normalizedIdSeguimiento = Number(idSeguimiento);
    const existingFollowUp = await getFollowUpById(normalizedIdSeguimiento);
    const payload = {
        idSeguimiento: normalizedIdSeguimiento,
        idAdopcion: Number(followUpData.idAdopcion),
        idTipoSeguimiento: Number(followUpData.idTipoSeguimiento),
        fechaInicio: parseDateValue(followUpData.fechaInicio, 'Start date'),
        fechaFin: parseDateValue(followUpData.fechaFin, 'End date'),
        comentarios: normalizeOptionalText(followUpData.comentarios),
        idEstado: Number(followUpData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [adoption, trackingType] = await Promise.all([
        adoptionService.getAdoptionById(payload.idAdopcion),
        trackingTypeService.getTrackingTypeById(payload.idTipoSeguimiento)
    ]);

    ensureValidDateRange(payload.fechaInicio, payload.fechaFin);
    ensureDatesAreNotBeforeAdoption(adoption, payload.fechaInicio, payload.fechaFin);
    ensureActiveFollowUpCanUseAssignments({
        adoption,
        trackingType,
        nextState: payload.idEstado
    });
    await ensureStructuralChangesAreAllowed(existingFollowUp, payload);
    await ensureFollowUpCanBeDisabled(existingFollowUp, payload.idEstado);

    await followUpRepository.updateFollowUp(payload);
    invalidateRelatedCaches(
        payload.idSeguimiento,
        [existingFollowUp.idAdopcion, payload.idAdopcion],
        [existingFollowUp.idTipoSeguimiento, payload.idTipoSeguimiento]
    );

    return getFollowUpById(payload.idSeguimiento);
}

async function deleteFollowUp(idSeguimiento) {
    const normalizedIdSeguimiento = Number(idSeguimiento);
    const existingFollowUp = await getFollowUpById(normalizedIdSeguimiento);

    await ensureFollowUpCanBeDeleted(existingFollowUp);
    await followUpRepository.deleteFollowUp(normalizedIdSeguimiento);
    invalidateRelatedCaches(
        normalizedIdSeguimiento,
        [existingFollowUp.idAdopcion],
        [existingFollowUp.idTipoSeguimiento]
    );
}

module.exports = {
    getFollowUps,
    getFollowUpById,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp,
    invalidateFollowUpReadCaches: invalidateFollowUpCache
};
