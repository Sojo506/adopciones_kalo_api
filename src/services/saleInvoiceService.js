const saleInvoiceRepository = require('../repositories/saleInvoiceRepository');
const saleService = require('./saleService');
const invoiceService = require('./invoiceService');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const SALE_INVOICE_LIST_CACHE_KEY = 'sale-invoice:list';
const SALE_INVOICE_DETAIL_CACHE_PREFIX = 'sale-invoice:detail:';
const SALE_INVOICE_CACHE_TTL_MS = Number(process.env.SALE_INVOICE_CACHE_TTL_MS || 15000);
const saleInvoiceQueryCache = new MemoryCache({ defaultTtlMs: SALE_INVOICE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeInvoiceId(value) {
    return String(value || '').trim();
}

function normalizeSaleInvoiceKey(idVenta, idFactura) {
    return `${String(idVenta).trim()}:${normalizeInvoiceId(idFactura)}`;
}

function getSaleInvoiceDetailCacheKey(idVenta, idFactura) {
    return `${SALE_INVOICE_DETAIL_CACHE_PREFIX}${normalizeSaleInvoiceKey(idVenta, idFactura)}`;
}

function invalidateSaleInvoiceCache(idVenta, idFactura) {
    saleInvoiceQueryCache.delete(SALE_INVOICE_LIST_CACHE_KEY);

    if (
        idVenta !== undefined &&
        idVenta !== null &&
        idFactura !== undefined &&
        idFactura !== null
    ) {
        saleInvoiceQueryCache.delete(getSaleInvoiceDetailCacheKey(idVenta, idFactura));
        return;
    }

    saleInvoiceQueryCache.clearByPrefix(SALE_INVOICE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idVenta, idFactura) {
    invalidateSaleInvoiceCache(idVenta, idFactura);
    saleService.invalidateSaleQueryCaches(idVenta);
    invoiceService.invalidateInvoiceQueryCaches(idFactura);
}

function formatSaleInvoiceBase(saleInvoice) {
    return {
        idVenta: Number(saleInvoice.ID_VENTA),
        idFactura: saleInvoice.ID_FACTURA,
        idEstado: Number(saleInvoice.ID_ESTADO),
        estado: saleInvoice.ESTADO || null
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
    return saleService.getSaleById(idVenta);
}

async function ensureInvoiceExists(idFactura) {
    return invoiceService.getInvoiceById(idFactura);
}

function ensureActiveSaleInvoiceCanBeApplied({ sale, invoice, idEstado }) {
    if (Number(idEstado) !== 1) {
        return;
    }

    if (Number(sale.idEstado) !== 1) {
        throw createHttpError('Cannot keep a sale-invoice relation active for an inactive sale', 409);
    }

    if (Number(invoice.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a sale-invoice relation active for an inactive invoice',
            409
        );
    }
}

function hydrateSaleInvoice(baseSaleInvoice, sale, invoice) {
    return {
        ...baseSaleInvoice,
        cliente: sale?.cliente || null,
        totalVenta: Number(sale?.totalVenta || 0),
        moneda: invoice?.moneda || null,
        simbolo: invoice?.simbolo || null,
        totalFactura: Number(invoice?.total || 0),
        fechaFactura: invoice?.fechaFactura || null
    };
}

async function getSaleInvoices() {
    return saleInvoiceQueryCache.getOrSet(SALE_INVOICE_LIST_CACHE_KEY, async () => {
        const [saleInvoices, sales, invoices] = await Promise.all([
            saleInvoiceRepository.findAllSaleInvoices(),
            saleService.getSales(),
            invoiceService.getInvoices()
        ]);

        const salesById = new Map(sales.map((sale) => [Number(sale.idVenta), sale]));
        const invoicesById = new Map(
            invoices.map((invoice) => [normalizeInvoiceId(invoice.idFactura), invoice])
        );

        return saleInvoices.map((saleInvoice) => {
            const baseSaleInvoice = formatSaleInvoiceBase(saleInvoice);

            return hydrateSaleInvoice(
                baseSaleInvoice,
                salesById.get(baseSaleInvoice.idVenta) || null,
                invoicesById.get(normalizeInvoiceId(baseSaleInvoice.idFactura)) || null
            );
        });
    });
}

async function getSaleInvoiceByPk(idVenta, idFactura) {
    return saleInvoiceQueryCache.getOrSet(
        getSaleInvoiceDetailCacheKey(idVenta, idFactura),
        async () => {
            const saleInvoice = await saleInvoiceRepository.findSaleInvoiceByPk(idVenta, idFactura);

            if (!saleInvoice) {
                throw createHttpError('Sale-invoice relation not found', 404);
            }

            const baseSaleInvoice = formatSaleInvoiceBase(saleInvoice);
            const [sale, invoice] = await Promise.all([
                ensureSaleExists(baseSaleInvoice.idVenta),
                ensureInvoiceExists(baseSaleInvoice.idFactura)
            ]);

            return hydrateSaleInvoice(baseSaleInvoice, sale, invoice);
        }
    );
}

async function createSaleInvoice(saleInvoiceData) {
    const requestedState =
        saleInvoiceData.idEstado === undefined ||
        saleInvoiceData.idEstado === null ||
        saleInvoiceData.idEstado === ''
            ? 1
            : Number(saleInvoiceData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New sale-invoice relations must start in active state', 400);
    }

    const payload = {
        idVenta: Number(saleInvoiceData.idVenta),
        idFactura: normalizeInvoiceId(saleInvoiceData.idFactura),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [sale, invoice] = await Promise.all([
        ensureSaleExists(payload.idVenta),
        ensureInvoiceExists(payload.idFactura)
    ]);
    ensureActiveSaleInvoiceCanBeApplied({ sale, invoice, idEstado: payload.idEstado });

    const existingSaleInvoice = await saleInvoiceRepository.findSaleInvoiceByPk(
        payload.idVenta,
        payload.idFactura
    );

    if (existingSaleInvoice) {
        throw createHttpError('Sale-invoice relation already exists', 409);
    }

    await saleInvoiceRepository.createSaleInvoice(payload);
    invalidateRelatedCaches(payload.idVenta, payload.idFactura);

    return getSaleInvoiceByPk(payload.idVenta, payload.idFactura);
}

async function updateSaleInvoice(idVenta, idFactura, saleInvoiceData) {
    const normalizedIdVenta = Number(idVenta);
    const normalizedIdFactura = normalizeInvoiceId(idFactura);
    const existingSaleInvoice = await getSaleInvoiceByPk(normalizedIdVenta, normalizedIdFactura);
    const payload = {
        idVenta: normalizedIdVenta,
        idFactura: normalizedIdFactura,
        idEstado: Number(saleInvoiceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    if (Number(payload.idEstado) === 1) {
        const [sale, invoice] = await Promise.all([
            ensureSaleExists(payload.idVenta),
            ensureInvoiceExists(payload.idFactura)
        ]);

        ensureActiveSaleInvoiceCanBeApplied({ sale, invoice, idEstado: payload.idEstado });
    }

    await saleInvoiceRepository.updateSaleInvoice(payload);
    invalidateRelatedCaches(existingSaleInvoice.idVenta, existingSaleInvoice.idFactura);

    return getSaleInvoiceByPk(payload.idVenta, payload.idFactura);
}

async function deleteSaleInvoice(idVenta, idFactura) {
    const existingSaleInvoice = await getSaleInvoiceByPk(idVenta, idFactura);

    await saleInvoiceRepository.deleteSaleInvoice(idVenta, idFactura);
    invalidateRelatedCaches(existingSaleInvoice.idVenta, existingSaleInvoice.idFactura);
}

module.exports = {
    getSaleInvoices,
    getSaleInvoiceByPk,
    createSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice
};
