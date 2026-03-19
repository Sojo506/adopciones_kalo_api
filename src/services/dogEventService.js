const dogRepository = require('../repositories/dogRepository');
const eventTypeRepository = require('../repositories/eventTypeRepository');
const dogEventRepository = require('../repositories/dogEventRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const DOG_EVENT_LIST_CACHE_KEY = 'dog-event:list';
const DOG_EVENT_DETAIL_CACHE_PREFIX = 'dog-event:detail:';
const DOG_EVENT_CACHE_TTL_MS = Number(process.env.DOG_EVENT_CACHE_TTL_MS || 15000);
const dogEventQueryCache = new MemoryCache({ defaultTtlMs: DOG_EVENT_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getDogEventDetailCacheKey(idEvento) {
    return `${DOG_EVENT_DETAIL_CACHE_PREFIX}${String(idEvento).trim()}`;
}

function invalidateDogEventCache(idEvento) {
    dogEventQueryCache.delete(DOG_EVENT_LIST_CACHE_KEY);

    if (idEvento !== undefined && idEvento !== null) {
        dogEventQueryCache.delete(getDogEventDetailCacheKey(idEvento));
        return;
    }

    dogEventQueryCache.clearByPrefix(DOG_EVENT_DETAIL_CACHE_PREFIX);
}

function normalizeRequiredText(value, fieldLabel) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    return normalizedValue;
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

function parsePositiveInteger(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedValue;
}

function parseAmount(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        throw createHttpError(`${fieldLabel} must be zero or greater`, 400);
    }

    return parsedValue;
}

function formatDogEvent(dogEvent) {
    return {
        idEvento: Number(dogEvent.ID_EVENTO),
        idPerrito: Number(dogEvent.ID_PERRITO),
        nombrePerrito: dogEvent.NOMBRE_PERRITO || null,
        idTipoEvento: Number(dogEvent.ID_TIPO_EVENTO),
        tipoEvento: dogEvent.TIPO_EVENTO || null,
        fechaEvento: dogEvent.FECHA_EVENTO || null,
        detalle: dogEvent.DETALLE || null,
        totalGasto:
            dogEvent.TOTAL_GASTO === null || dogEvent.TOTAL_GASTO === undefined
                ? null
                : Number(dogEvent.TOTAL_GASTO),
        idEstado: Number(dogEvent.ID_ESTADO),
        estado: dogEvent.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureDogExists(idPerrito) {
    const dog = await dogRepository.findDogById(idPerrito);

    if (!dog) {
        throw createHttpError('Dog not found', 404);
    }

    return {
        idPerrito: Number(dog.ID_PERRITO),
        idEstado: Number(dog.ID_ESTADO)
    };
}

async function ensureEventTypeExists(idTipoEvento) {
    const eventType = await eventTypeRepository.findEventTypeById(idTipoEvento);

    if (!eventType) {
        throw createHttpError('Event type not found', 404);
    }

    return eventType;
}

function ensureActiveEventCanUseAssignments({ dog, eventType, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(dog.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep an event active for an inactive dog',
            409
        );
    }

    if (Number(eventType.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep an event active under an inactive event type',
            409
        );
    }
}

async function ensureDogEventCanBeDisabled(existingDogEvent, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingDogEvent.idEstado) !== 1) {
        return;
    }

    const activeDetailsCount = await dogEventRepository.countActiveDetailsByEvent(
        existingDogEvent.idEvento
    );

    if (activeDetailsCount > 0) {
        throw createHttpError(
            'Cannot deactivate an event that still has active detail records',
            409
        );
    }
}

async function ensureDogEventCanBeDeleted(existingDogEvent) {
    if (Number(existingDogEvent.idEstado) !== 1) {
        throw createHttpError('Dog event is already inactive', 409);
    }

    const activeDetailsCount = await dogEventRepository.countActiveDetailsByEvent(
        existingDogEvent.idEvento
    );

    if (activeDetailsCount > 0) {
        throw createHttpError(
            'Cannot delete an event that still has active detail records',
            409
        );
    }
}

function normalizeCreatePayload(dogEventData) {
    return {
        idPerrito: parsePositiveInteger(dogEventData.idPerrito, 'Dog'),
        idTipoEvento: parsePositiveInteger(dogEventData.idTipoEvento, 'Event type'),
        fechaEvento: parseDateValue(dogEventData.fechaEvento, 'Event date'),
        detalle: normalizeRequiredText(dogEventData.detalle, 'Event detail'),
        totalGasto: parseAmount(dogEventData.totalGasto, 'Total amount'),
        idEstado: parsePositiveInteger(dogEventData.idEstado, 'State')
    };
}

function normalizeUpdatePayload(dogEventData) {
    return {
        idPerrito: parsePositiveInteger(dogEventData.idPerrito, 'Dog'),
        idTipoEvento: parsePositiveInteger(dogEventData.idTipoEvento, 'Event type'),
        fechaEvento: parseDateValue(dogEventData.fechaEvento, 'Event date'),
        detalle: normalizeRequiredText(dogEventData.detalle, 'Event detail'),
        totalGasto: parseAmount(dogEventData.totalGasto, 'Total amount'),
        idEstado: parsePositiveInteger(dogEventData.idEstado, 'State')
    };
}

async function getDogEvents() {
    return dogEventQueryCache.getOrSet(DOG_EVENT_LIST_CACHE_KEY, async () => {
        const dogEvents = await dogEventRepository.findAllDogEvents();
        return dogEvents.map((dogEvent) => formatDogEvent(dogEvent));
    });
}

async function getDogEventById(idEvento) {
    return dogEventQueryCache.getOrSet(getDogEventDetailCacheKey(idEvento), async () => {
        const dogEvent = await dogEventRepository.findDogEventById(idEvento);

        if (!dogEvent) {
            throw createHttpError('Dog event not found', 404);
        }

        return formatDogEvent(dogEvent);
    });
}

async function createDogEvent(dogEventData) {
    const requestedState =
        dogEventData.idEstado === undefined || dogEventData.idEstado === null || dogEventData.idEstado === ''
            ? 1
            : Number(dogEventData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New dog events must start in active state', 400);
    }

    const payload = normalizeCreatePayload({
        ...dogEventData,
        idEstado: requestedState
    });

    await ensureStateExists(payload.idEstado);
    const [dog, eventType] = await Promise.all([
        ensureDogExists(payload.idPerrito),
        ensureEventTypeExists(payload.idTipoEvento)
    ]);
    ensureActiveEventCanUseAssignments({
        dog,
        eventType,
        nextState: payload.idEstado
    });

    const result = await dogEventRepository.createDogEvent(payload);
    invalidateDogEventCache(result.idEvento);

    return getDogEventById(result.idEvento);
}

async function updateDogEvent(idEvento, dogEventData) {
    const normalizedIdEvento = Number(idEvento);
    const existingDogEvent = await getDogEventById(normalizedIdEvento);
    const payload = normalizeUpdatePayload(dogEventData);

    await ensureStateExists(payload.idEstado);
    const [dog, eventType] = await Promise.all([
        ensureDogExists(payload.idPerrito),
        ensureEventTypeExists(payload.idTipoEvento)
    ]);
    ensureActiveEventCanUseAssignments({
        dog,
        eventType,
        nextState: payload.idEstado
    });
    await ensureDogEventCanBeDisabled(existingDogEvent, payload.idEstado);

    await dogEventRepository.updateDogEvent({
        idEvento: normalizedIdEvento,
        ...payload
    });
    invalidateDogEventCache(normalizedIdEvento);

    return getDogEventById(normalizedIdEvento);
}

async function deleteDogEvent(idEvento) {
    const normalizedIdEvento = Number(idEvento);
    const existingDogEvent = await getDogEventById(normalizedIdEvento);

    await ensureDogEventCanBeDeleted(existingDogEvent);
    await dogEventRepository.deleteDogEvent(normalizedIdEvento);
    invalidateDogEventCache(normalizedIdEvento);
}

module.exports = {
    getDogEvents,
    getDogEventById,
    createDogEvent,
    updateDogEvent,
    deleteDogEvent,
    invalidateDogEventReadCaches: invalidateDogEventCache
};
