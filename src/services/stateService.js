const catalogService = require('./catalogService');
const stateRepository = require('../repositories/stateRepository');
const MemoryCache = require('../utils/memoryCache');

const STATE_LIST_CACHE_KEY = 'state:list';
const STATE_DETAIL_CACHE_PREFIX = 'state:detail:';
const STATE_CACHE_TTL_MS = Number(process.env.STATE_CACHE_TTL_MS || 15000);
const RESERVED_STATE_IDS = new Set([1, 2, 3]);
const RESERVED_STATE_NAMES = new Set(['activo', 'inactivo', 'pendiente']);
const stateQueryCache = new MemoryCache({ defaultTtlMs: STATE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeStateName(value) {
    return String(value || '').trim().toLowerCase();
}

function getStateDetailCacheKey(idEstado) {
    return `${STATE_DETAIL_CACHE_PREFIX}${String(idEstado).trim()}`;
}

function invalidateStateCache(idEstado) {
    stateQueryCache.delete(STATE_LIST_CACHE_KEY);

    if (idEstado !== undefined && idEstado !== null) {
        stateQueryCache.delete(getStateDetailCacheKey(idEstado));
        return;
    }

    stateQueryCache.clearByPrefix(STATE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idEstado = null) {
    invalidateStateCache(idEstado);
    catalogService.invalidateStatesCache();
}

function formatState(state) {
    return {
        idEstado: state.ID_ESTADO,
        nombreEstado: state.NOMBRE_ESTADO,
        fechaCreacion: state.FECHA_CREACION || null,
        fechaModificacion: state.FECHA_MODIFICACION || null,
        creadoPor: state.CREADO_POR || null,
        modificadoPor: state.MODIFICADO_POR || null,
        accion: state.ACCION || null
    };
}

function isReservedState(state) {
    return (
        RESERVED_STATE_IDS.has(Number(state.idEstado)) ||
        RESERVED_STATE_NAMES.has(normalizeStateName(state.nombreEstado))
    );
}

async function ensureStateNameIsAvailable(nombreEstado, { excludeId = null } = {}) {
    const normalizedName = normalizeStateName(nombreEstado);
    const states = await getStates();
    const duplicatedState = states.find(
        (state) =>
            normalizeStateName(state.nombreEstado) === normalizedName &&
            Number(state.idEstado) !== Number(excludeId)
    );

    if (duplicatedState) {
        throw createHttpError('State name already exists', 409);
    }
}

async function ensureReservedStateRemainsStable(existingState, nextName) {
    if (!isReservedState(existingState)) {
        return;
    }

    if (normalizeStateName(existingState.nombreEstado) !== normalizeStateName(nextName)) {
        throw createHttpError(
            'The reserved states "Activo", "Inactivo" and "Pendiente" cannot be renamed',
            409
        );
    }
}

async function getStates() {
    return stateQueryCache.getOrSet(STATE_LIST_CACHE_KEY, async () => {
        const states = await stateRepository.findAllStates();
        return states.map(formatState);
    });
}

async function getStateById(idEstado) {
    return stateQueryCache.getOrSet(getStateDetailCacheKey(idEstado), async () => {
        const state = await stateRepository.findStateById(idEstado);

        if (!state) {
            throw createHttpError('State not found', 404);
        }

        return formatState(state);
    });
}

async function createState(stateData) {
    const payload = {
        nombreEstado: String(stateData.nombreEstado || '').trim()
    };

    await ensureStateNameIsAvailable(payload.nombreEstado);

    const result = await stateRepository.createState(payload);
    invalidateRelatedCaches(result.idEstado);

    return getStateById(result.idEstado);
}

async function updateState(idEstado, stateData) {
    const existingState = await getStateById(idEstado);
    const payload = {
        idEstado: Number(idEstado),
        nombreEstado: String(stateData.nombreEstado || '').trim()
    };

    await ensureStateNameIsAvailable(payload.nombreEstado, { excludeId: payload.idEstado });
    await ensureReservedStateRemainsStable(existingState, payload.nombreEstado);

    await stateRepository.updateState(payload);
    invalidateRelatedCaches(payload.idEstado);

    return getStateById(payload.idEstado);
}

async function deleteState(idEstado) {
    const existingState = await getStateById(idEstado);

    if (isReservedState(existingState)) {
        throw createHttpError(
            'The reserved states "Activo", "Inactivo" and "Pendiente" cannot be deleted',
            409
        );
    }

    await stateRepository.deleteState(idEstado);
    invalidateRelatedCaches(idEstado);
}

module.exports = {
    getStates,
    getStateById,
    createState,
    updateState,
    deleteState
};
