const saleProductRepository = require('../repositories/saleProductRepository');
const saleRepository = require('../repositories/saleRepository');
const productRepository = require('../repositories/productRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const inventoryMovementRepository = require('../repositories/inventoryMovementRepository');
const catalogService = require('./catalogService');
const saleService = require('./saleService');
const MemoryCache = require('../utils/memoryCache');

const SALE_PRODUCT_LIST_CACHE_KEY = 'sale-product:list';
const SALE_PRODUCT_DETAIL_CACHE_PREFIX = 'sale-product:detail:';
const SALE_PRODUCT_CACHE_TTL_MS = Number(process.env.SALE_PRODUCT_CACHE_TTL_MS || 15000);
const saleProductQueryCache = new MemoryCache({ defaultTtlMs: SALE_PRODUCT_CACHE_TTL_MS });

const EGRESO_KEYWORDS = ['egreso', 'salida', 'venta', 'ajustenegativo'];

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeSaleProductKey(idVenta, idProducto) {
    return `${String(idVenta).trim()}:${String(idProducto).trim()}`;
}

function getSaleProductDetailCacheKey(idVenta, idProducto) {
    return `${SALE_PRODUCT_DETAIL_CACHE_PREFIX}${normalizeSaleProductKey(idVenta, idProducto)}`;
}

function invalidateSaleProductCache(idVenta, idProducto) {
    saleProductQueryCache.delete(SALE_PRODUCT_LIST_CACHE_KEY);

    if (idVenta !== undefined && idVenta !== null && idProducto !== undefined && idProducto !== null) {
        saleProductQueryCache.delete(getSaleProductDetailCacheKey(idVenta, idProducto));
        return;
    }

    saleProductQueryCache.clearByPrefix(SALE_PRODUCT_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idVenta, idProducto) {
    invalidateSaleProductCache(idVenta, idProducto);
    saleService.invalidateSaleQueryCaches(idVenta);
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function ensurePositiveQuantity(cantidad) {
    if (!Number.isInteger(cantidad) || cantidad <= 0) {
        throw createHttpError('Cantidad must be a positive integer', 400);
    }
}

function ensureValidUnitPrice(precioUnitario) {
    if (!Number.isFinite(precioUnitario) || precioUnitario < 0) {
        throw createHttpError('Unit price must be greater than or equal to zero', 400);
    }
}

function normalizeKeyword(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

function ensureEgresoMovementType(movementTypeName) {
    const normalizedName = normalizeKeyword(movementTypeName);
    const isEgreso = EGRESO_KEYWORDS.some((keyword) => normalizedName.includes(keyword));

    if (!isEgreso) {
        throw createHttpError(
            'Active sale detail lines must use a movement type configured as EGRESO',
            409
        );
    }
}

function formatSaleProduct(saleProduct) {
    return {
        idVenta: Number(saleProduct.ID_VENTA),
        idProducto: Number(saleProduct.ID_PRODUCTO),
        producto: saleProduct.PRODUCTO || null,
        idTipoMovimiento: Number(saleProduct.ID_TIPO_MOVIMIENTO),
        tipoMovimiento: saleProduct.TIPO_MOVIMIENTO || null,
        cantidad: Number(saleProduct.CANTIDAD || 0),
        precioUnitario: roundMoney(saleProduct.PRECIO_UNITARIO || 0),
        total: roundMoney(saleProduct.TOTAL || 0),
        idEstado: Number(saleProduct.ID_ESTADO),
        estado: saleProduct.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureSaleExists(idVenta) {
    const sale = await saleRepository.findSaleById(idVenta);

    if (!sale) {
        throw createHttpError('Sale not found', 404);
    }

    return {
        idVenta: Number(sale.ID_VENTA),
        identificacion: Number(sale.IDENTIFICACION),
        totalVenta: roundMoney(sale.TOTAL_VENTA || 0),
        fechaVenta: sale.FECHA_VENTA,
        idEstado: Number(sale.ID_ESTADO),
        cliente: sale.CLIENTE || null
    };
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

async function ensureInventoryAvailabilityForActiveSaleProduct(idProducto, cantidad, idEstado) {
    if (Number(idEstado) !== 1) {
        return null;
    }

    const inventories = await inventoryRepository.findInventoriesByProductId(idProducto);

    if (!inventories.length) {
        throw createHttpError(
            'Cannot create an active sale detail for a product without inventory',
            409
        );
    }

    const inventory = inventories[0];
    const availableQuantity = Number(inventory.CANTIDAD || 0);
    const inventoryState = Number(inventory.ID_ESTADO);

    if (inventoryState !== 1) {
        throw createHttpError(
            'Cannot create an active sale detail for a product with inactive inventory',
            409
        );
    }

    if (availableQuantity < Number(cantidad)) {
        throw createHttpError(
            'The requested quantity exceeds the available stock in inventory',
            409
        );
    }

    return {
        idInventario: Number(inventory.ID_INVENTARIO),
        cantidad: availableQuantity,
        idEstado: inventoryState
    };
}

function ensureActiveSaleProductCanBeApplied({ sale, product, movementType, idEstado }) {
    if (Number(idEstado) !== 1) {
        return;
    }

    if (Number(sale.idEstado) !== 1) {
        throw createHttpError('Cannot keep a sale detail active for an inactive sale', 409);
    }

    if (Number(product.idEstado) !== 1) {
        throw createHttpError('Cannot keep a sale detail active for an inactive product', 409);
    }

    if (Number(movementType.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a sale detail active with an inactive movement type',
            409
        );
    }

    ensureEgresoMovementType(movementType.nombre);
}

async function ensureSaleHasNoActiveInvoices(idVenta, action) {
    const activeInvoices = await saleRepository.countActiveSaleInvoices(idVenta);

    if (activeInvoices > 0) {
        throw createHttpError(
            `Cannot ${action} sale details for a sale that already has active invoices`,
            409
        );
    }
}

async function hydrateSaleProduct(saleProduct) {
    const baseSaleProduct = formatSaleProduct(saleProduct);

    if (baseSaleProduct.producto && baseSaleProduct.tipoMovimiento) {
        return baseSaleProduct;
    }

    const [product, movementType] = await Promise.all([
        ensureProductExists(baseSaleProduct.idProducto),
        ensureMovementTypeExists(baseSaleProduct.idTipoMovimiento)
    ]);

    return {
        ...baseSaleProduct,
        producto: baseSaleProduct.producto || product.nombre || null,
        tipoMovimiento: baseSaleProduct.tipoMovimiento || movementType.nombre || null
    };
}

async function getSaleProducts() {
    return saleProductQueryCache.getOrSet(SALE_PRODUCT_LIST_CACHE_KEY, async () => {
        const saleProducts = await saleProductRepository.findAllSaleProducts();
        return saleProducts.map(formatSaleProduct);
    });
}

async function getSaleProductByPk(idVenta, idProducto) {
    return saleProductQueryCache.getOrSet(
        getSaleProductDetailCacheKey(idVenta, idProducto),
        async () => {
            const saleProduct = await saleProductRepository.findSaleProductByPk(idVenta, idProducto);

            if (!saleProduct) {
                throw createHttpError('Sale detail not found', 404);
            }

            return hydrateSaleProduct(saleProduct);
        }
    );
}

async function createSaleProduct(saleProductData) {
    const payload = {
        idVenta: Number(saleProductData.idVenta),
        idProducto: Number(saleProductData.idProducto),
        idTipoMovimiento: Number(saleProductData.idTipoMovimiento),
        cantidad: Number(saleProductData.cantidad),
        precioUnitario: roundMoney(saleProductData.precioUnitario),
        idEstado: Number(saleProductData.idEstado)
    };

    ensurePositiveQuantity(payload.cantidad);
    ensureValidUnitPrice(payload.precioUnitario);
    await ensureStateExists(payload.idEstado);
    const [sale, product, movementType] = await Promise.all([
        ensureSaleExists(payload.idVenta),
        ensureProductExists(payload.idProducto),
        ensureMovementTypeExists(payload.idTipoMovimiento)
    ]);

    await ensureSaleHasNoActiveInvoices(payload.idVenta, 'create');
    ensureActiveSaleProductCanBeApplied({
        sale,
        product,
        movementType,
        idEstado: payload.idEstado
    });
    await ensureInventoryAvailabilityForActiveSaleProduct(
        payload.idProducto,
        payload.cantidad,
        payload.idEstado
    );

    const existingSaleProduct = await saleProductRepository.findSaleProductByPk(
        payload.idVenta,
        payload.idProducto
    );

    if (existingSaleProduct) {
        throw createHttpError('Sale detail already exists', 409);
    }

    await saleProductRepository.createSaleProduct(payload);
    invalidateRelatedCaches(payload.idVenta, payload.idProducto);

    return getSaleProductByPk(payload.idVenta, payload.idProducto);
}

async function updateSaleProduct(idVenta, idProducto, saleProductData) {
    const normalizedIdVenta = Number(idVenta);
    const normalizedIdProducto = Number(idProducto);
    const existingSaleProduct = await getSaleProductByPk(normalizedIdVenta, normalizedIdProducto);
    const payload = {
        idVenta: normalizedIdVenta,
        idProducto: normalizedIdProducto,
        idTipoMovimiento: Number(saleProductData.idTipoMovimiento),
        cantidad: Number(saleProductData.cantidad),
        precioUnitario: roundMoney(saleProductData.precioUnitario),
        idEstado: Number(saleProductData.idEstado)
    };

    ensurePositiveQuantity(payload.cantidad);
    ensureValidUnitPrice(payload.precioUnitario);
    await ensureStateExists(payload.idEstado);
    const [sale, product, movementType] = await Promise.all([
        ensureSaleExists(payload.idVenta),
        ensureProductExists(payload.idProducto),
        ensureMovementTypeExists(payload.idTipoMovimiento)
    ]);

    await ensureSaleHasNoActiveInvoices(payload.idVenta, 'update');
    ensureActiveSaleProductCanBeApplied({
        sale,
        product,
        movementType,
        idEstado: payload.idEstado
    });
    await ensureInventoryAvailabilityForActiveSaleProduct(
        payload.idProducto,
        payload.cantidad,
        payload.idEstado
    );

    await saleProductRepository.updateSaleProduct(payload);
    invalidateRelatedCaches(payload.idVenta, payload.idProducto);

    return getSaleProductByPk(
        existingSaleProduct.idVenta,
        existingSaleProduct.idProducto
    );
}

async function deleteSaleProduct(idVenta, idProducto) {
    const existingSaleProduct = await getSaleProductByPk(idVenta, idProducto);

    if (Number(existingSaleProduct.idEstado) !== 1) {
        throw createHttpError('Sale detail is already inactive', 409);
    }

    await ensureSaleHasNoActiveInvoices(existingSaleProduct.idVenta, 'delete');
    await saleProductRepository.deleteSaleProduct(existingSaleProduct.idVenta, existingSaleProduct.idProducto);
    invalidateRelatedCaches(existingSaleProduct.idVenta, existingSaleProduct.idProducto);
}

module.exports = {
    getSaleProducts,
    getSaleProductByPk,
    createSaleProduct,
    updateSaleProduct,
    deleteSaleProduct
};
