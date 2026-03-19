const inventoryMovementRepository = require('../repositories/inventoryMovementRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const productRepository = require('../repositories/productRepository');
const catalogService = require('./catalogService');
const inventoryService = require('./inventoryService');
const MemoryCache = require('../utils/memoryCache');

const MOVEMENT_LIST_CACHE_KEY = 'inventory-movement:list';
const MOVEMENT_DETAIL_CACHE_PREFIX = 'inventory-movement:detail:';
const MOVEMENT_TYPES_CACHE_KEY = 'inventory-movement:types';
const MOVEMENT_CACHE_TTL_MS = Number(process.env.INVENTORY_MOVEMENT_CACHE_TTL_MS || 15000);
const inventoryMovementCache = new MemoryCache({ defaultTtlMs: MOVEMENT_CACHE_TTL_MS });

const MOVEMENT_DIRECTION_KEYWORDS = {
    ingreso: ['ingreso', 'entrada', 'reposicion', 'abastecimiento', 'ajustepositivo'],
    egreso: ['egreso', 'salida', 'venta', 'ajustenegativo']
};

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getMovementDetailCacheKey(idMovimiento) {
    return `${MOVEMENT_DETAIL_CACHE_PREFIX}${String(idMovimiento).trim()}`;
}

function invalidateMovementCaches(idMovimiento) {
    inventoryMovementCache.delete(MOVEMENT_LIST_CACHE_KEY);
    inventoryMovementCache.delete(MOVEMENT_TYPES_CACHE_KEY);

    if (idMovimiento !== undefined && idMovimiento !== null) {
        inventoryMovementCache.delete(getMovementDetailCacheKey(idMovimiento));
        return;
    }

    inventoryMovementCache.clearByPrefix(MOVEMENT_DETAIL_CACHE_PREFIX);
}

function invalidateInventoryMovementQueryCaches() {
    invalidateMovementCaches();
}

function normalizeKeyword(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function resolveDirectionFromTypeName(typeName) {
    const normalizedName = normalizeKeyword(typeName);

    if (MOVEMENT_DIRECTION_KEYWORDS.ingreso.some((keyword) => normalizedName.includes(keyword))) {
        return 'ingreso';
    }

    if (MOVEMENT_DIRECTION_KEYWORDS.egreso.some((keyword) => normalizedName.includes(keyword))) {
        return 'egreso';
    }

    throw createHttpError(
        'The selected movement type is not configured as INGRESO or EGRESO',
        409
    );
}

function getSignedDelta(typeName, cantidad) {
    const direction = resolveDirectionFromTypeName(typeName);
    const absoluteQuantity = Number(cantidad);

    return direction === 'ingreso' ? absoluteQuantity : -absoluteQuantity;
}

function serializeDate(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function parseMovementDate(value) {
    if (!value) {
        return new Date();
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createHttpError('Movement date is invalid', 400);
    }

    return date;
}

function ensurePositiveQuantity(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw createHttpError('Cantidad must be a positive integer', 400);
    }
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureProductExists(idProducto) {
    const product = await productRepository.findProductById(idProducto);

    if (!product) {
        throw createHttpError('Product not found', 404);
    }

    return {
        idProducto: Number(product.ID_PRODUCTO),
        nombre: product.NOMBRE || null,
        idEstado: Number(product.ID_ESTADO)
    };
}

async function ensureMovementTypeExists(idTipoMovimiento) {
    const movementType = await inventoryMovementRepository.findMovementTypeById(idTipoMovimiento);

    if (!movementType) {
        throw createHttpError('Movement type not found', 404);
    }

    return {
        idTipoMovimiento: Number(movementType.ID_TIPO_MOVIMIENTO),
        nombre: movementType.NOMBRE || null,
        idEstado: Number(movementType.ID_ESTADO),
        estado: movementType.ESTADO || null
    };
}

async function getInventoryForProduct(idProducto) {
    const inventories = await inventoryRepository.findInventoriesByProductId(idProducto);

    if (!inventories.length) {
        throw createHttpError(
            'This product does not have an inventory record yet',
            409
        );
    }

    const inventory = inventories[0];

    return {
        idInventario: Number(inventory.ID_INVENTARIO),
        idProducto: Number(inventory.ID_PRODUCTO),
        producto: inventory.PRODUCTO || null,
        cantidad: Number(inventory.CANTIDAD || 0),
        idEstado: Number(inventory.ID_ESTADO),
        estado: inventory.ESTADO || null
    };
}

function ensureActiveMovementCanBeApplied({ movementState, movementType, product, inventory }) {
    if (Number(movementState) !== 1) {
        return;
    }

    if (Number(movementType.idEstado) !== 1) {
        throw createHttpError('Cannot apply an active movement with an inactive movement type', 409);
    }

    if (Number(product.idEstado) !== 1) {
        throw createHttpError('Cannot apply an active movement to an inactive product', 409);
    }

    if (Number(inventory.idEstado) !== 1) {
        throw createHttpError('Cannot apply an active movement to an inactive inventory', 409);
    }
}

function ensureInventoryQuantityIsValid(inventory, nextQuantity) {
    if (nextQuantity < 0) {
        throw createHttpError(
            'The movement leaves the inventory with negative stock',
            409
        );
    }

    if (Number(inventory.idEstado) !== 1 && nextQuantity > 0) {
        throw createHttpError(
            'Inactive inventory cannot hold stock greater than zero',
            409
        );
    }
}

function formatMovement(movement) {
    return {
        idMovimiento: Number(movement.ID_MOVIMIENTO),
        idProducto: Number(movement.ID_PRODUCTO),
        producto: movement.PRODUCTO || null,
        idTipoMovimiento: Number(movement.ID_TIPO_MOVIMIENTO),
        tipoMovimiento: movement.TIPO_MOVIMIENTO || null,
        cantidad: Number(movement.CANTIDAD || 0),
        fechaMovimiento: serializeDate(movement.FECHA_MOVIMIENTO),
        idEstado: Number(movement.ID_ESTADO),
        estado: movement.ESTADO || null
    };
}

function formatMovementType(movementType) {
    return {
        idTipoMovimiento: Number(movementType.ID_TIPO_MOVIMIENTO),
        nombre: movementType.NOMBRE || null,
        idEstado: Number(movementType.ID_ESTADO),
        estado: movementType.ESTADO || null
    };
}

async function syncInventoryQuantity(inventory, nextQuantity) {
    await inventoryRepository.updateInventory({
        idInventario: inventory.idInventario,
        idProducto: inventory.idProducto,
        cantidad: nextQuantity,
        idEstado: inventory.idEstado
    });

    inventoryService.invalidateInventoryRelatedCaches(inventory.idInventario, inventory.idProducto);
}

async function rollbackMovementUpdate(previousMovement) {
    if (!previousMovement?.ID_MOVIMIENTO) {
        return;
    }

    try {
        await inventoryMovementRepository.updateInventoryMovement({
            idMovimiento: Number(previousMovement.ID_MOVIMIENTO),
            idProducto: Number(previousMovement.ID_PRODUCTO),
            idTipoMovimiento: Number(previousMovement.ID_TIPO_MOVIMIENTO),
            cantidad: Number(previousMovement.CANTIDAD),
            fechaMovimiento: previousMovement.FECHA_MOVIMIENTO,
            idEstado: Number(previousMovement.ID_ESTADO)
        });
    } catch (error) {
        console.error('Failed to rollback inventory movement update:', error);
    }
}

async function getInventoryMovements() {
    return inventoryMovementCache.getOrSet(MOVEMENT_LIST_CACHE_KEY, async () => {
        const movements = await inventoryMovementRepository.findAllInventoryMovementsForAdmin();
        return movements.map(formatMovement);
    });
}

async function getInventoryMovementById(idMovimiento) {
    return inventoryMovementCache.getOrSet(getMovementDetailCacheKey(idMovimiento), async () => {
        const movement = await inventoryMovementRepository.findInventoryMovementById(idMovimiento);

        if (!movement) {
            throw createHttpError('Inventory movement not found', 404);
        }

        return formatMovement(movement);
    });
}

async function getActiveMovementTypes() {
    return inventoryMovementCache.getOrSet(MOVEMENT_TYPES_CACHE_KEY, async () => {
        const movementTypes = await inventoryMovementRepository.findActiveMovementTypes();
        return movementTypes.map(formatMovementType);
    });
}

async function createInventoryMovement(movementData) {
    const payload = {
        idProducto: Number(movementData.idProducto),
        idTipoMovimiento: Number(movementData.idTipoMovimiento),
        cantidad: Number(movementData.cantidad),
        fechaMovimiento: parseMovementDate(movementData.fechaMovimiento),
        idEstado: Number(movementData.idEstado)
    };

    ensurePositiveQuantity(payload.cantidad);
    await ensureStateExists(payload.idEstado);

    const [product, movementType, inventory] = await Promise.all([
        ensureProductExists(payload.idProducto),
        ensureMovementTypeExists(payload.idTipoMovimiento),
        getInventoryForProduct(payload.idProducto)
    ]);

    ensureActiveMovementCanBeApplied({
        movementState: payload.idEstado,
        movementType,
        product,
        inventory
    });

    const signedDelta =
        Number(payload.idEstado) === 1 ? getSignedDelta(movementType.nombre, payload.cantidad) : 0;
    const nextQuantity = Number(inventory.cantidad) + signedDelta;
    ensureInventoryQuantityIsValid(inventory, nextQuantity);

    let createdMovement = null;

    try {
        createdMovement = await inventoryMovementRepository.createInventoryMovement(payload);
        await syncInventoryQuantity(inventory, nextQuantity);
        invalidateMovementCaches(createdMovement.idMovimiento);
        return getInventoryMovementById(createdMovement.idMovimiento);
    } catch (error) {
        if (createdMovement?.idMovimiento) {
            try {
                await inventoryMovementRepository.deleteInventoryMovement(createdMovement.idMovimiento);
            } catch (rollbackError) {
                console.error('Failed to rollback created inventory movement:', rollbackError);
            }
        }

        throw error;
    }
}

async function updateInventoryMovement(idMovimiento, movementData) {
    const currentMovement = await inventoryMovementRepository.findInventoryMovementById(idMovimiento);

    if (!currentMovement) {
        throw createHttpError('Inventory movement not found', 404);
    }

    const payload = {
        idMovimiento: Number(idMovimiento),
        idProducto: Number(movementData.idProducto),
        idTipoMovimiento: Number(movementData.idTipoMovimiento),
        cantidad: Number(movementData.cantidad),
        fechaMovimiento: parseMovementDate(movementData.fechaMovimiento),
        idEstado: Number(movementData.idEstado)
    };

    ensurePositiveQuantity(payload.cantidad);
    await ensureStateExists(payload.idEstado);

    if (payload.idProducto !== Number(currentMovement.ID_PRODUCTO)) {
        throw createHttpError(
            'An inventory movement must stay linked to the same product',
            409
        );
    }

    const [product, movementType, inventory] = await Promise.all([
        ensureProductExists(payload.idProducto),
        ensureMovementTypeExists(payload.idTipoMovimiento),
        getInventoryForProduct(payload.idProducto)
    ]);

    ensureActiveMovementCanBeApplied({
        movementState: payload.idEstado,
        movementType,
        product,
        inventory
    });

    const previousDelta =
        Number(currentMovement.ID_ESTADO) === 1
            ? getSignedDelta(currentMovement.TIPO_MOVIMIENTO, Number(currentMovement.CANTIDAD))
            : 0;
    const nextDelta =
        Number(payload.idEstado) === 1 ? getSignedDelta(movementType.nombre, payload.cantidad) : 0;
    const nextQuantity = Number(inventory.cantidad) - previousDelta + nextDelta;

    ensureInventoryQuantityIsValid(inventory, nextQuantity);

    let movementWasUpdated = false;

    try {
        await inventoryMovementRepository.updateInventoryMovement(payload);
        movementWasUpdated = true;
        await syncInventoryQuantity(inventory, nextQuantity);
        invalidateMovementCaches(payload.idMovimiento);
        return getInventoryMovementById(payload.idMovimiento);
    } catch (error) {
        if (movementWasUpdated) {
            await rollbackMovementUpdate(currentMovement);
        }

        throw error;
    }
}

async function deleteInventoryMovement(idMovimiento) {
    const currentMovement = await inventoryMovementRepository.findInventoryMovementById(idMovimiento);

    if (!currentMovement) {
        throw createHttpError('Inventory movement not found', 404);
    }

    if (Number(currentMovement.ID_ESTADO) !== 1) {
        throw createHttpError('Inventory movement is already inactive', 409);
    }

    const inventory = await getInventoryForProduct(currentMovement.ID_PRODUCTO);
    const previousDelta = getSignedDelta(
        currentMovement.TIPO_MOVIMIENTO,
        Number(currentMovement.CANTIDAD)
    );
    const nextQuantity = Number(inventory.cantidad) - previousDelta;

    ensureInventoryQuantityIsValid(inventory, nextQuantity);

    let movementWasDeleted = false;

    try {
        await inventoryMovementRepository.deleteInventoryMovement(idMovimiento);
        movementWasDeleted = true;
        await syncInventoryQuantity(inventory, nextQuantity);
        invalidateMovementCaches(idMovimiento);
    } catch (error) {
        if (movementWasDeleted) {
            await rollbackMovementUpdate(currentMovement);
        }

        throw error;
    }
}

module.exports = {
    getInventoryMovements,
    getInventoryMovementById,
    getActiveMovementTypes,
    createInventoryMovement,
    updateInventoryMovement,
    deleteInventoryMovement,
    invalidateInventoryMovementQueryCaches
};
