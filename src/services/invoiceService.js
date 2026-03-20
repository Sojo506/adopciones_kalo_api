const currencyRepository = require('../repositories/currencyRepository');
const invoiceRepository = require('../repositories/invoiceRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const INVOICE_LIST_CACHE_KEY = 'invoice:list';
const INVOICE_DETAIL_CACHE_PREFIX = 'invoice:detail:';
const INVOICE_CACHE_TTL_MS = Number(process.env.INVOICE_CACHE_TTL_MS || 15000);
const invoiceQueryCache = new MemoryCache({ defaultTtlMs: INVOICE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeInvoiceId(value) {
    return String(value || '').trim();
}

function getInvoiceDetailCacheKey(idFactura) {
    return `${INVOICE_DETAIL_CACHE_PREFIX}${normalizeInvoiceId(idFactura)}`;
}

function invalidateInvoiceCache(idFactura) {
    invoiceQueryCache.delete(INVOICE_LIST_CACHE_KEY);

    if (idFactura !== undefined && idFactura !== null) {
        invoiceQueryCache.delete(getInvoiceDetailCacheKey(idFactura));
        return;
    }

    invoiceQueryCache.clearByPrefix(INVOICE_DETAIL_CACHE_PREFIX);
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

function parseInvoiceDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        throw createHttpError('Invoice date is invalid', 400);
    }

    return date;
}

function normalizeTaxRate(value) {
    if (value === undefined || value === null || value === '') {
        return 0.13;
    }

    const normalizedValue = Number(value);

    if (!Number.isFinite(normalizedValue) || normalizedValue < 0) {
        throw createHttpError('Tax rate must be greater than or equal to zero', 400);
    }

    return Math.round(normalizedValue * 10000) / 10000;
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function formatInvoice(invoice) {
    return {
        idFactura: invoice.ID_FACTURA,
        idMoneda: Number(invoice.ID_MONEDA),
        moneda: invoice.MONEDA || null,
        simbolo: invoice.SIMBOLO || null,
        tasaImpuestoAplicada: Number(invoice.TASA_IMPUESTO_APLICADA || 0),
        impuesto: roundMoney(invoice.IMPUESTO || 0),
        subtotal: roundMoney(invoice.SUBTOTAL || 0),
        total: roundMoney(invoice.TOTAL || 0),
        fechaFactura: serializeDate(invoice.FECHA_FACTURA),
        idEstado: Number(invoice.ID_ESTADO),
        estado: invoice.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCurrencyExists(idMoneda) {
    const currency = await currencyRepository.findCurrencyById(idMoneda);

    if (!currency) {
        throw createHttpError('Currency not found', 404);
    }

    return {
        idMoneda: Number(currency.ID_MONEDA),
        nombre: currency.NOMBRE || null,
        simbolo: currency.SIMBOLO || null,
        idEstado: Number(currency.ID_ESTADO)
    };
}

function ensureActiveInvoiceCanUseCurrency(currency, invoiceState) {
    if (Number(invoiceState) !== 1) {
        return;
    }

    if (Number(currency.idEstado) !== 1) {
        throw createHttpError('Cannot keep an invoice active for an inactive currency', 409);
    }
}

async function countActiveDependencies(idFactura) {
    const [saleRelationsCount, donationRelationsCount, paypalPaymentsCount] =
        await Promise.all([
            invoiceRepository.countActiveSaleRelationsByInvoice(idFactura),
            invoiceRepository.countActiveDonationRelationsByInvoice(idFactura),
            invoiceRepository.countActivePayPalPaymentsByInvoice(idFactura)
        ]);

    return {
        saleRelationsCount,
        donationRelationsCount,
        paypalPaymentsCount
    };
}

function createDependencyErrorMessage(action, dependencyCounts) {
    const dependencies = [];

    if (dependencyCounts.saleRelationsCount > 0) {
        dependencies.push('sales');
    }

    if (dependencyCounts.donationRelationsCount > 0) {
        dependencies.push('donations');
    }

    if (dependencyCounts.paypalPaymentsCount > 0) {
        dependencies.push('PayPal payments');
    }

    if (dependencies.length === 1) {
        return `Cannot ${action} an invoice that still has active ${dependencies[0]}`;
    }

    if (dependencies.length === 2) {
        return `Cannot ${action} an invoice that still has active ${dependencies[0]} or ${dependencies[1]}`;
    }

    return `Cannot ${action} an invoice that still has active ${dependencies.slice(0, -1).join(', ')} or ${dependencies[dependencies.length - 1]}`;
}

async function ensureInvoiceCanBeDisabled(existingInvoice, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingInvoice.idEstado) !== 1) {
        return;
    }

    const dependencyCounts = await countActiveDependencies(existingInvoice.idFactura);

    if (
        dependencyCounts.saleRelationsCount > 0 ||
        dependencyCounts.donationRelationsCount > 0 ||
        dependencyCounts.paypalPaymentsCount > 0
    ) {
        throw createHttpError(createDependencyErrorMessage('deactivate', dependencyCounts), 409);
    }
}

async function ensureInvoiceCanBeDeleted(existingInvoice) {
    if (Number(existingInvoice.idEstado) !== 1) {
        throw createHttpError('Invoice is already inactive', 409);
    }

    const dependencyCounts = await countActiveDependencies(existingInvoice.idFactura);

    if (
        dependencyCounts.saleRelationsCount > 0 ||
        dependencyCounts.donationRelationsCount > 0 ||
        dependencyCounts.paypalPaymentsCount > 0
    ) {
        throw createHttpError(createDependencyErrorMessage('delete', dependencyCounts), 409);
    }
}

async function getInvoices() {
    return invoiceQueryCache.getOrSet(INVOICE_LIST_CACHE_KEY, async () => {
        const invoices = await invoiceRepository.findAllInvoices();
        return invoices.map(formatInvoice);
    });
}

async function getInvoiceById(idFactura) {
    return invoiceQueryCache.getOrSet(getInvoiceDetailCacheKey(idFactura), async () => {
        const invoice = await invoiceRepository.findInvoiceById(idFactura);

        if (!invoice) {
            throw createHttpError('Invoice not found', 404);
        }

        return formatInvoice(invoice);
    });
}

async function createInvoice(invoiceData) {
    const requestedState =
        invoiceData.idEstado === undefined || invoiceData.idEstado === null || invoiceData.idEstado === ''
            ? 1
            : Number(invoiceData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New invoices must start in active state', 400);
    }

    const payload = {
        idMoneda: Number(invoiceData.idMoneda),
        tasaImpuestoAplicada: normalizeTaxRate(invoiceData.tasaImpuestoAplicada),
        fechaFactura: parseInvoiceDate(invoiceData.fechaFactura),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const currency = await ensureCurrencyExists(payload.idMoneda);
    ensureActiveInvoiceCanUseCurrency(currency, payload.idEstado);

    const result = await invoiceRepository.createInvoice(payload);
    invalidateInvoiceCache(result.idFactura);

    return getInvoiceById(result.idFactura);
}

async function updateInvoice(idFactura, invoiceData) {
    const existingInvoice = await getInvoiceById(idFactura);
    const payload = {
        idFactura: normalizeInvoiceId(idFactura),
        idMoneda: Number(invoiceData.idMoneda),
        tasaImpuestoAplicada: normalizeTaxRate(invoiceData.tasaImpuestoAplicada),
        fechaFactura: parseInvoiceDate(invoiceData.fechaFactura),
        idEstado: Number(invoiceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const currency = await ensureCurrencyExists(payload.idMoneda);
    ensureActiveInvoiceCanUseCurrency(currency, payload.idEstado);
    await ensureInvoiceCanBeDisabled(existingInvoice, payload.idEstado);

    await invoiceRepository.updateInvoice(payload);
    invalidateInvoiceCache(payload.idFactura);

    return getInvoiceById(payload.idFactura);
}

async function deleteInvoice(idFactura) {
    const existingInvoice = await getInvoiceById(idFactura);

    await ensureInvoiceCanBeDeleted(existingInvoice);
    await invoiceRepository.deleteInvoice(idFactura);
    invalidateInvoiceCache(idFactura);
}

module.exports = {
    getInvoices,
    getInvoiceById,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    invalidateInvoiceQueryCaches: invalidateInvoiceCache
};
