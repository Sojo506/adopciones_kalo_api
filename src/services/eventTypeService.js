const catalogService = require('./catalogService');
const eventTypeRepository = require('../repositories/eventTypeRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const EVENT_TYPE_LIST_CACHE_KEY = 'event-type:list';
const EVENT_TYPE_DETAIL_CACHE_PREFIX = 'event-type:detail:';
const EVENT_TYPE_CACHE_TTL_MS = Number(process.env.EVENT_TYPE_CACHE_TTL_MS || 15000);
const eventTypeQueryCache = new MemoryCache({
    defaultTtlMs: EVENT_TYPE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeEventTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getEventTypeDetailCacheKey(idTipoEvento) {
    return `${EVENT_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoEvento).trim()}`;
}

function invalidateEventTypeCache(idTipoEvento) {
    eventTypeQueryCache.delete(EVENT_TYPE_LIST_CACHE_KEY);

    if (idTipoEvento !== undefined && idTipoEvento !== null) {
        eventTypeQueryCache.delete(getEventTypeDetailCacheKey(idTipoEvento));
        return;
    }

    eventTypeQueryCache.clearByPrefix(EVENT_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoEvento = null) {
    invalidateEventTypeCache(idTipoEvento);
    catalogService.invalidateEventTypesCache();
}

function formatEventType(eventType) {
    return {
        idTipoEvento: eventType.ID_TIPO_EVENTO,
        nombre: eventType.NOMBRE,
        idEstado: eventType.ID_ESTADO,
        estado: eventType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureEventTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeEventTypeName(nombre);
    const eventTypes = await getEventTypes();
    const duplicatedEventType = eventTypes.find(
        (eventType) =>
            normalizeEventTypeName(eventType.nombre) === normalizedName &&
            Number(eventType.idTipoEvento) !== Number(excludeId)
    );

    if (duplicatedEventType) {
        throw createHttpError('Event type name already exists', 409);
    }
}

async function ensureEventTypeCanBeDisabled(existingEventType, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingEventType.idEstado)) {
        return;
    }

    const activeEventsCount = await eventTypeRepository.countActiveEventsByType(
        existingEventType.idTipoEvento
    );

    if (activeEventsCount > 0) {
        throw createHttpError(
            'Cannot deactivate an event type that still has active events',
            409
        );
    }
}

async function ensureEventTypeCanBeDeleted(existingEventType) {
    if (isInactiveState(existingEventType.idEstado)) {
        throw createHttpError('Event type is already inactive', 409);
    }

    const activeEventsCount = await eventTypeRepository.countActiveEventsByType(
        existingEventType.idTipoEvento
    );

    if (activeEventsCount > 0) {
        throw createHttpError(
            'Cannot delete an event type that still has active events',
            409
        );
    }
}

async function getEventTypes() {
    return eventTypeQueryCache.getOrSet(EVENT_TYPE_LIST_CACHE_KEY, async () => {
        const eventTypes = await eventTypeRepository.findAllEventTypesForAdmin();
        return eventTypes.map(formatEventType);
    });
}

async function getEventTypeById(idTipoEvento) {
    return eventTypeQueryCache.getOrSet(
        getEventTypeDetailCacheKey(idTipoEvento),
        async () => {
            const eventType = await eventTypeRepository.findEventTypeById(idTipoEvento);

            if (!eventType) {
                throw createHttpError('Event type not found', 404);
            }

            return formatEventType(eventType);
        }
    );
}

async function createEventType(eventTypeData) {
    const payload = {
        nombre: String(eventTypeData.nombre || '').trim(),
        idEstado: Number(eventTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureEventTypeNameIsAvailable(payload.nombre);

    const result = await eventTypeRepository.createEventType(payload);
    invalidateRelatedCaches(result.idTipoEvento);

    return getEventTypeById(result.idTipoEvento);
}

async function updateEventType(idTipoEvento, eventTypeData) {
    const existingEventType = await getEventTypeById(idTipoEvento);
    const payload = {
        idTipoEvento: Number(idTipoEvento),
        nombre: String(eventTypeData.nombre || '').trim(),
        idEstado: Number(eventTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureEventTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoEvento
    });
    await ensureEventTypeCanBeDisabled(existingEventType, payload.idEstado);

    await eventTypeRepository.updateEventType(payload);
    invalidateRelatedCaches(payload.idTipoEvento);

    return getEventTypeById(payload.idTipoEvento);
}

async function deleteEventType(idTipoEvento) {
    const existingEventType = await getEventTypeById(idTipoEvento);

    await ensureEventTypeCanBeDeleted(existingEventType);
    await eventTypeRepository.deleteEventType(idTipoEvento);
    invalidateRelatedCaches(idTipoEvento);
}

module.exports = {
    getEventTypes,
    getEventTypeById,
    createEventType,
    updateEventType,
    deleteEventType
};
