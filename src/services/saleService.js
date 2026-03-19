const saleRepository = require('../repositories/saleRepository');
const userRepository = require('../repositories/userRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const SALE_LIST_CACHE_KEY = 'sale:list';
const SALE_DETAIL_CACHE_PREFIX = 'sale:detail:';
const SALE_CACHE_TTL_MS = Number(process.env.SALE_CACHE_TTL_MS || 15000);
const saleQueryCache = new MemoryCache({ defaultTtlMs: SALE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getSaleDetailCacheKey(idVenta) {
    return `${SALE_DETAIL_CACHE_PREFIX}${String(idVenta).trim()}`;
}

function invalidateSaleCache(idVenta) {
    saleQueryCache.delete(SALE_LIST_CACHE_KEY);

    if (idVenta !== undefined && idVenta !== null) {
        saleQueryCache.delete(getSaleDetailCacheKey(idVenta));
        return;
    }

    saleQueryCache.clearByPrefix(SALE_DETAIL_CACHE_PREFIX);
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

function parseSaleDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createHttpError('Sale date is invalid', 400);
    }

    return date;
}

function formatSale(sale) {
    return {
        idVenta: Number(sale.ID_VENTA),
        identificacion: Number(sale.IDENTIFICACION),
        cliente: sale.CLIENTE || null,
        totalVenta: Number(sale.TOTAL_VENTA || 0),
        fechaVenta: serializeDate(sale.FECHA_VENTA),
        idEstado: Number(sale.ID_ESTADO),
        estado: sale.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureUserExists(identificacion) {
    const user = await userRepository.findByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return {
        identificacion: Number(user.IDENTIFICACION),
        idEstado: Number(user.ID_ESTADO),
        nombre: [user.NOMBRE, user.APELLIDO_PATERNO, user.APELLIDO_MATERNO]
            .filter(Boolean)
            .join(' ') || null
    };
}

function ensureActiveSaleCanUseUser(user, saleState) {
    if (Number(saleState) !== 1) {
        return;
    }

    if (Number(user.idEstado) !== 1) {
        throw createHttpError('Cannot keep a sale active for an inactive user', 409);
    }
}

async function countActiveDependencies(idVenta) {
    const [saleDetailsCount, saleInvoicesCount] = await Promise.all([
        saleRepository.countActiveSaleDetails(idVenta),
        saleRepository.countActiveSaleInvoices(idVenta)
    ]);

    return {
        saleDetailsCount,
        saleInvoicesCount
    };
}

function createDependencyErrorMessage(action, dependencyCounts) {
    if (dependencyCounts.saleDetailsCount > 0 && dependencyCounts.saleInvoicesCount > 0) {
        return `Cannot ${action} a sale that still has active sale details or invoices`;
    }

    if (dependencyCounts.saleDetailsCount > 0) {
        return `Cannot ${action} a sale that still has active sale details`;
    }

    return `Cannot ${action} a sale that still has active invoices`;
}

async function ensureSaleCanBeDisabled(existingSale, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingSale.idEstado) !== 1) {
        return;
    }

    const dependencyCounts = await countActiveDependencies(existingSale.idVenta);

    if (dependencyCounts.saleDetailsCount > 0 || dependencyCounts.saleInvoicesCount > 0) {
        throw createHttpError(createDependencyErrorMessage('deactivate', dependencyCounts), 409);
    }
}

async function ensureSaleCanBeDeleted(existingSale) {
    if (Number(existingSale.idEstado) !== 1) {
        throw createHttpError('Sale is already inactive', 409);
    }

    const dependencyCounts = await countActiveDependencies(existingSale.idVenta);

    if (dependencyCounts.saleDetailsCount > 0 || dependencyCounts.saleInvoicesCount > 0) {
        throw createHttpError(createDependencyErrorMessage('delete', dependencyCounts), 409);
    }
}

async function getSales() {
    return saleQueryCache.getOrSet(SALE_LIST_CACHE_KEY, async () => {
        const sales = await saleRepository.findAllSales();
        return sales.map(formatSale);
    });
}

async function getSaleById(idVenta) {
    return saleQueryCache.getOrSet(getSaleDetailCacheKey(idVenta), async () => {
        const sale = await saleRepository.findSaleById(idVenta);

        if (!sale) {
            throw createHttpError('Sale not found', 404);
        }

        return formatSale(sale);
    });
}

async function createSale(saleData) {
    const payload = {
        identificacion: Number(saleData.identificacion),
        totalVenta: 0,
        fechaVenta: parseSaleDate(saleData.fechaVenta),
        idEstado: Number(saleData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const user = await ensureUserExists(payload.identificacion);
    ensureActiveSaleCanUseUser(user, payload.idEstado);

    const result = await saleRepository.createSale(payload);
    invalidateSaleCache(result.idVenta);

    return getSaleById(result.idVenta);
}

async function updateSale(idVenta, saleData) {
    const existingSale = await getSaleById(idVenta);
    const payload = {
        idVenta: Number(idVenta),
        identificacion: Number(saleData.identificacion),
        totalVenta: Number(existingSale.totalVenta || 0),
        fechaVenta: parseSaleDate(saleData.fechaVenta),
        idEstado: Number(saleData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const user = await ensureUserExists(payload.identificacion);
    ensureActiveSaleCanUseUser(user, payload.idEstado);
    await ensureSaleCanBeDisabled(existingSale, payload.idEstado);

    await saleRepository.updateSale(payload);
    invalidateSaleCache(payload.idVenta);

    return getSaleById(payload.idVenta);
}

async function deleteSale(idVenta) {
    const existingSale = await getSaleById(idVenta);

    await ensureSaleCanBeDeleted(existingSale);
    await saleRepository.deleteSale(idVenta);
    invalidateSaleCache(idVenta);
}

module.exports = {
    getSales,
    getSaleById,
    createSale,
    updateSale,
    deleteSale,
    invalidateSaleQueryCaches: invalidateSaleCache
};
