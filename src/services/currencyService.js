const catalogService = require('./catalogService');
const currencyRepository = require('../repositories/currencyRepository');
const MemoryCache = require('../utils/memoryCache');

const CURRENCY_LIST_CACHE_KEY = 'currency:list';
const CURRENCY_DETAIL_CACHE_PREFIX = 'currency:detail:';
const CURRENCY_CACHE_TTL_MS = Number(process.env.CURRENCY_CACHE_TTL_MS || 15000);
const currencyQueryCache = new MemoryCache({ defaultTtlMs: CURRENCY_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCurrencyName(value) {
    return String(value || '').trim().toLowerCase();
}

function getCurrencyDetailCacheKey(idMoneda) {
    return `${CURRENCY_DETAIL_CACHE_PREFIX}${String(idMoneda).trim()}`;
}

function invalidateCurrencyCache(idMoneda) {
    currencyQueryCache.delete(CURRENCY_LIST_CACHE_KEY);

    if (idMoneda !== undefined && idMoneda !== null) {
        currencyQueryCache.delete(getCurrencyDetailCacheKey(idMoneda));
        return;
    }

    currencyQueryCache.clearByPrefix(CURRENCY_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idMoneda = null) {
    invalidateCurrencyCache(idMoneda);
    catalogService.invalidateCurrenciesCache();
}

function formatCurrency(currency) {
    return {
        idMoneda: currency.ID_MONEDA,
        nombre: currency.NOMBRE,
        simbolo: currency.SIMBOLO,
        idEstado: currency.ID_ESTADO,
        estado: currency.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCurrencyNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeCurrencyName(nombre);
    const currencies = await getCurrencies();
    const duplicatedCurrency = currencies.find(
        (currency) =>
            normalizeCurrencyName(currency.nombre) === normalizedName &&
            Number(currency.idMoneda) !== Number(excludeId)
    );

    if (duplicatedCurrency) {
        throw createHttpError('Currency name already exists', 409);
    }
}

async function ensureCurrencyCanBeDisabled(existingCurrency, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingCurrency.idEstado) !== 1) {
        return;
    }

    const activeInvoicesCount = await currencyRepository.countActiveInvoicesByCurrency(
        existingCurrency.idMoneda
    );

    if (activeInvoicesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a currency that still has active invoices',
            409
        );
    }
}

async function ensureCurrencyCanBeDeleted(existingCurrency) {
    if (Number(existingCurrency.idEstado) !== 1) {
        throw createHttpError('Currency is already inactive', 409);
    }

    const activeInvoicesCount = await currencyRepository.countActiveInvoicesByCurrency(
        existingCurrency.idMoneda
    );

    if (activeInvoicesCount > 0) {
        throw createHttpError(
            'Cannot delete a currency that still has active invoices',
            409
        );
    }
}

async function getCurrencies() {
    return currencyQueryCache.getOrSet(CURRENCY_LIST_CACHE_KEY, async () => {
        const currencies = await currencyRepository.findAllCurrenciesForAdmin();
        return currencies.map(formatCurrency);
    });
}

async function getCurrencyById(idMoneda) {
    return currencyQueryCache.getOrSet(getCurrencyDetailCacheKey(idMoneda), async () => {
        const currency = await currencyRepository.findCurrencyById(idMoneda);

        if (!currency) {
            throw createHttpError('Currency not found', 404);
        }

        return formatCurrency(currency);
    });
}

async function createCurrency(currencyData) {
    const payload = {
        nombre: String(currencyData.nombre || '').trim(),
        simbolo: String(currencyData.simbolo || '').trim(),
        idEstado: Number(currencyData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCurrencyNameIsAvailable(payload.nombre);

    const result = await currencyRepository.createCurrency(payload);
    invalidateRelatedCaches(result.idMoneda);

    return getCurrencyById(result.idMoneda);
}

async function updateCurrency(idMoneda, currencyData) {
    const existingCurrency = await getCurrencyById(idMoneda);
    const payload = {
        idMoneda: Number(idMoneda),
        nombre: String(currencyData.nombre || '').trim(),
        simbolo: String(currencyData.simbolo || '').trim(),
        idEstado: Number(currencyData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCurrencyNameIsAvailable(payload.nombre, { excludeId: payload.idMoneda });
    await ensureCurrencyCanBeDisabled(existingCurrency, payload.idEstado);

    await currencyRepository.updateCurrency(payload);
    invalidateRelatedCaches(payload.idMoneda);

    return getCurrencyById(payload.idMoneda);
}

async function deleteCurrency(idMoneda) {
    const existingCurrency = await getCurrencyById(idMoneda);

    await ensureCurrencyCanBeDeleted(existingCurrency);
    await currencyRepository.deleteCurrency(idMoneda);
    invalidateRelatedCaches(idMoneda);
}

module.exports = {
    getCurrencies,
    getCurrencyById,
    createCurrency,
    updateCurrency,
    deleteCurrency
};
