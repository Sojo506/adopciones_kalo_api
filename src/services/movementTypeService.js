const catalogService = require('./catalogService');
const inventoryMovementService = require('./inventoryMovementService');
const movementTypeRepository = require('../repositories/movementTypeRepository');
const MemoryCache = require('../utils/memoryCache');

const MOVEMENT_TYPE_LIST_CACHE_KEY = 'movement-type:list';
const MOVEMENT_TYPE_DETAIL_CACHE_PREFIX = 'movement-type:detail:';
const MOVEMENT_TYPE_CACHE_TTL_MS = Number(process.env.MOVEMENT_TYPE_CACHE_TTL_MS || 15000);
const movementTypeQueryCache = new MemoryCache({
    defaultTtlMs: MOVEMENT_TYPE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeMovementTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getMovementTypeDetailCacheKey(idTipoMovimiento) {
    return `${MOVEMENT_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoMovimiento).trim()}`;
}

function invalidateMovementTypeCache(idTipoMovimiento) {
    movementTypeQueryCache.delete(MOVEMENT_TYPE_LIST_CACHE_KEY);

    if (idTipoMovimiento !== undefined && idTipoMovimiento !== null) {
        movementTypeQueryCache.delete(getMovementTypeDetailCacheKey(idTipoMovimiento));
        return;
    }

    movementTypeQueryCache.clearByPrefix(MOVEMENT_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoMovimiento = null) {
    invalidateMovementTypeCache(idTipoMovimiento);
    catalogService.invalidateMovementTypesCache();
    inventoryMovementService.invalidateInventoryMovementQueryCaches();
}

function formatMovementType(movementType) {
    return {
        idTipoMovimiento: movementType.ID_TIPO_MOVIMIENTO,
        nombre: movementType.NOMBRE,
        idEstado: movementType.ID_ESTADO,
        estado: movementType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureMovementTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeMovementTypeName(nombre);
    const movementTypes = await getMovementTypes();
    const duplicatedMovementType = movementTypes.find(
        (movementType) =>
            normalizeMovementTypeName(movementType.nombre) === normalizedName &&
            Number(movementType.idTipoMovimiento) !== Number(excludeId)
    );

    if (duplicatedMovementType) {
        throw createHttpError('Movement type name already exists', 409);
    }
}

async function countActiveDependencies(idTipoMovimiento) {
    const [inventoryMovementsCount, saleDetailsCount] = await Promise.all([
        movementTypeRepository.countActiveInventoryMovementsByType(idTipoMovimiento),
        movementTypeRepository.countActiveSaleDetailsByType(idTipoMovimiento)
    ]);

    return {
        inventoryMovementsCount,
        saleDetailsCount
    };
}

function createDependencyErrorMessage(action, dependencyCounts) {
    if (
        dependencyCounts.inventoryMovementsCount > 0 &&
        dependencyCounts.saleDetailsCount > 0
    ) {
        return `Cannot ${action} a movement type that still has active inventory movements or sale details`;
    }

    if (dependencyCounts.inventoryMovementsCount > 0) {
        return `Cannot ${action} a movement type that still has active inventory movements`;
    }

    return `Cannot ${action} a movement type that still has active sale details`;
}

async function ensureMovementTypeCanBeDisabled(existingMovementType, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingMovementType.idEstado) !== 1) {
        return;
    }

    const dependencyCounts = await countActiveDependencies(
        existingMovementType.idTipoMovimiento
    );

    if (
        dependencyCounts.inventoryMovementsCount > 0 ||
        dependencyCounts.saleDetailsCount > 0
    ) {
        throw createHttpError(createDependencyErrorMessage('deactivate', dependencyCounts), 409);
    }
}

async function ensureMovementTypeCanBeDeleted(existingMovementType) {
    if (Number(existingMovementType.idEstado) !== 1) {
        throw createHttpError('Movement type is already inactive', 409);
    }

    const dependencyCounts = await countActiveDependencies(
        existingMovementType.idTipoMovimiento
    );

    if (
        dependencyCounts.inventoryMovementsCount > 0 ||
        dependencyCounts.saleDetailsCount > 0
    ) {
        throw createHttpError(createDependencyErrorMessage('delete', dependencyCounts), 409);
    }
}

async function getMovementTypes() {
    return movementTypeQueryCache.getOrSet(MOVEMENT_TYPE_LIST_CACHE_KEY, async () => {
        const movementTypes = await movementTypeRepository.findAllMovementTypesForAdmin();
        return movementTypes.map(formatMovementType);
    });
}

async function getMovementTypeById(idTipoMovimiento) {
    return movementTypeQueryCache.getOrSet(
        getMovementTypeDetailCacheKey(idTipoMovimiento),
        async () => {
            const movementType = await movementTypeRepository.findMovementTypeById(
                idTipoMovimiento
            );

            if (!movementType) {
                throw createHttpError('Movement type not found', 404);
            }

            return formatMovementType(movementType);
        }
    );
}

async function createMovementType(movementTypeData) {
    const payload = {
        nombre: String(movementTypeData.nombre || '').trim(),
        idEstado: Number(movementTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureMovementTypeNameIsAvailable(payload.nombre);

    const result = await movementTypeRepository.createMovementType(payload);
    invalidateRelatedCaches(result.idTipoMovimiento);

    return getMovementTypeById(result.idTipoMovimiento);
}

async function updateMovementType(idTipoMovimiento, movementTypeData) {
    const existingMovementType = await getMovementTypeById(idTipoMovimiento);
    const payload = {
        idTipoMovimiento: Number(idTipoMovimiento),
        nombre: String(movementTypeData.nombre || '').trim(),
        idEstado: Number(movementTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureMovementTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoMovimiento
    });
    await ensureMovementTypeCanBeDisabled(existingMovementType, payload.idEstado);

    await movementTypeRepository.updateMovementType(payload);
    invalidateRelatedCaches(payload.idTipoMovimiento);

    return getMovementTypeById(payload.idTipoMovimiento);
}

async function deleteMovementType(idTipoMovimiento) {
    const existingMovementType = await getMovementTypeById(idTipoMovimiento);

    await ensureMovementTypeCanBeDeleted(existingMovementType);
    await movementTypeRepository.deleteMovementType(idTipoMovimiento);
    invalidateRelatedCaches(idTipoMovimiento);
}

module.exports = {
    getMovementTypes,
    getMovementTypeById,
    createMovementType,
    updateMovementType,
    deleteMovementType
};
