const inventoryRepository = require('../repositories/inventoryRepository');
const inventoryMovementRepository = require('../repositories/inventoryMovementRepository');
const productRepository = require('../repositories/productRepository');
const catalogService = require('./catalogService');
const productService = require('./productService');
const MemoryCache = require('../utils/memoryCache');

const INVENTORY_LIST_CACHE_KEY = 'inventory:list';
const INVENTORY_DETAIL_CACHE_PREFIX = 'inventory:detail:';
const INVENTORY_CACHE_TTL_MS = Number(process.env.INVENTORY_CACHE_TTL_MS || 15000);
const inventoryQueryCache = new MemoryCache({ defaultTtlMs: INVENTORY_CACHE_TTL_MS });

const MOVEMENT_DIRECTION_KEYWORDS = {
    ingreso: ['ingreso', 'entrada', 'reposicion', 'abastecimiento', 'ajustepositivo'],
    egreso: ['egreso', 'salida', 'venta', 'ajustenegativo']
};

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getInventoryDetailCacheKey(idInventario) {
    return `${INVENTORY_DETAIL_CACHE_PREFIX}${String(idInventario).trim()}`;
}

function invalidateInventoryCache(idInventario) {
    inventoryQueryCache.delete(INVENTORY_LIST_CACHE_KEY);

    if (idInventario !== undefined && idInventario !== null) {
        inventoryQueryCache.delete(getInventoryDetailCacheKey(idInventario));
        return;
    }

    inventoryQueryCache.clearByPrefix(INVENTORY_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idInventario, idProducto) {
    invalidateInventoryCache(idInventario);
    productService.invalidateProductReadCaches(idProducto);
}

function formatInventory(inventory) {
    return {
        idInventario: inventory.ID_INVENTARIO,
        idProducto: inventory.ID_PRODUCTO,
        producto: inventory.PRODUCTO || null,
        cantidad: Number(inventory.CANTIDAD || 0),
        stockMinimo: Number(inventory.STOCK_MINIMO ?? 10),
        idEstado: inventory.ID_ESTADO,
        estado: inventory.ESTADO || null
    };
}

function normalizeKeyword(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function isMovementTypeForDirection(movementTypeName, direction) {
    const normalizedName = normalizeKeyword(movementTypeName);

    return MOVEMENT_DIRECTION_KEYWORDS[direction].some((keyword) =>
        normalizedName.includes(keyword)
    );
}

function ensureValidQuantity(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad < 0) {
        throw createHttpError('Quantity must be a non-negative integer', 400);
    }
}

function ensureValidMinimumStock(stockMinimo) {
    if (!Number.isInteger(stockMinimo) || stockMinimo < 0) {
        throw createHttpError('Minimum stock must be a non-negative integer', 400);
    }
}

function ensureQuantityMatchesState(cantidad, idEstado) {
    if (Number(idEstado) === 1 || Number(cantidad) === 0) {
        return;
    }

    throw createHttpError(
        'Inactive inventory must keep quantity at zero',
        409
    );
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
        idProducto: product.ID_PRODUCTO,
        nombre: product.NOMBRE,
        idEstado: product.ID_ESTADO
    };
}

function ensureInventoryCanStayActiveForProduct(product, inventoryState) {
    if (Number(inventoryState) !== 1) {
        return;
    }

    if (Number(product.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep inventory active for an inactive product',
            409
        );
    }
}

async function ensureSingleInventoryPerProduct(idProducto, currentInventoryId = null) {
    const inventories = await inventoryRepository.findInventoriesByProductId(idProducto);
    const foreignInventories = inventories.filter(
        (inventory) => Number(inventory.ID_INVENTARIO) !== Number(currentInventoryId)
    );

    if (foreignInventories.length > 0) {
        throw createHttpError(
            'This product already has an inventory record',
            409
        );
    }
}

async function resolveMovementTypeForDelta(delta) {
    const direction = delta > 0 ? 'ingreso' : 'egreso';
    const movementTypes = await inventoryMovementRepository.findActiveMovementTypes();
    const movementType = movementTypes.find((candidate) =>
        isMovementTypeForDirection(candidate.NOMBRE, direction)
    );

    if (!movementType) {
        throw createHttpError(
            `No active movement type for ${direction.toUpperCase()} is configured in FIDE_TIPO_MOVIMIENTO_TB`,
            409
        );
    }

    return movementType;
}

async function createMovementForDelta(idProducto, delta) {
    if (!delta) {
        return null;
    }

    const movementType = await resolveMovementTypeForDelta(delta);
    const result = await inventoryMovementRepository.createInventoryMovement({
        idProducto,
        idTipoMovimiento: movementType.ID_TIPO_MOVIMIENTO,
        cantidad: Math.abs(delta),
        fechaMovimiento: new Date(),
        idEstado: 1
    });

    return {
        ...result,
        idTipoMovimiento: movementType.ID_TIPO_MOVIMIENTO
    };
}

async function rollbackMovement(movementResult) {
    if (!movementResult?.idMovimiento) {
        return;
    }

    try {
        await inventoryMovementRepository.deleteInventoryMovement(movementResult.idMovimiento);
    } catch (error) {
        console.error('Failed to rollback inventory movement:', error);
    }
}

async function getInventories() {
    return inventoryQueryCache.getOrSet(INVENTORY_LIST_CACHE_KEY, async () => {
        const inventories = await inventoryRepository.findAllInventoriesForAdmin();
        return inventories.map(formatInventory);
    });
}

async function getInventoryById(idInventario) {
    return inventoryQueryCache.getOrSet(getInventoryDetailCacheKey(idInventario), async () => {
        const inventory = await inventoryRepository.findInventoryById(idInventario);

        if (!inventory) {
            throw createHttpError('Inventory not found', 404);
        }

        return formatInventory(inventory);
    });
}

async function createInventory(inventoryData) {
    const payload = {
        idProducto: Number(inventoryData.idProducto),
        cantidad: Number(inventoryData.cantidad),
        stockMinimo:
            inventoryData.stockMinimo === undefined
                ? 10
                : Number(inventoryData.stockMinimo),
        idEstado: Number(inventoryData.idEstado)
    };

    ensureValidQuantity(payload.cantidad);
    ensureValidMinimumStock(payload.stockMinimo);
    ensureQuantityMatchesState(payload.cantidad, payload.idEstado);
    await ensureStateExists(payload.idEstado);
    const product = await ensureProductExists(payload.idProducto);
    ensureInventoryCanStayActiveForProduct(product, payload.idEstado);
    await ensureSingleInventoryPerProduct(payload.idProducto);

    let movementResult = null;

    if (payload.cantidad > 0) {
        movementResult = await createMovementForDelta(payload.idProducto, payload.cantidad);
    }

    try {
        const result = await inventoryRepository.createInventory(payload);
        invalidateRelatedCaches(result.idInventario, payload.idProducto);
        return getInventoryById(result.idInventario);
    } catch (error) {
        await rollbackMovement(movementResult);
        throw error;
    }
}

async function updateInventory(idInventario, inventoryData) {
    const existingInventory = await getInventoryById(idInventario);
    const payload = {
        idInventario: Number(idInventario),
        idProducto: Number(inventoryData.idProducto),
        cantidad: Number(inventoryData.cantidad),
        stockMinimo:
            inventoryData.stockMinimo === undefined
                ? Number(existingInventory.stockMinimo ?? 10)
                : Number(inventoryData.stockMinimo),
        idEstado: Number(inventoryData.idEstado)
    };

    ensureValidQuantity(payload.cantidad);
    ensureValidMinimumStock(payload.stockMinimo);
    ensureQuantityMatchesState(payload.cantidad, payload.idEstado);
    await ensureStateExists(payload.idEstado);

    if (Number(payload.idProducto) !== Number(existingInventory.idProducto)) {
        throw createHttpError(
            'An inventory record must stay linked to the same product',
            409
        );
    }

    const product = await ensureProductExists(payload.idProducto);
    ensureInventoryCanStayActiveForProduct(product, payload.idEstado);
    await ensureSingleInventoryPerProduct(payload.idProducto, payload.idInventario);

    const delta = payload.cantidad - Number(existingInventory.cantidad || 0);
    let movementResult = null;

    if (delta !== 0) {
        movementResult = await createMovementForDelta(payload.idProducto, delta);
    }

    try {
        await inventoryRepository.updateInventory(payload);
        invalidateRelatedCaches(payload.idInventario, payload.idProducto);
        return getInventoryById(payload.idInventario);
    } catch (error) {
        await rollbackMovement(movementResult);
        throw error;
    }
}

async function deleteInventory(idInventario) {
    const existingInventory = await getInventoryById(idInventario);

    if (Number(existingInventory.idEstado) !== 1) {
        throw createHttpError('Inventory is already inactive', 409);
    }

    if (Number(existingInventory.cantidad || 0) > 0) {
        throw createHttpError(
            'Cannot deactivate inventory with stock available. Register an EGRESO adjustment first.',
            409
        );
    }

    await inventoryRepository.deleteInventory(idInventario);
    invalidateRelatedCaches(idInventario, existingInventory.idProducto);
}

module.exports = {
    getInventories,
    getInventoryById,
    createInventory,
    updateInventory,
    deleteInventory,
    invalidateInventoryReadCaches: invalidateInventoryCache,
    invalidateInventoryRelatedCaches: invalidateRelatedCaches
};
