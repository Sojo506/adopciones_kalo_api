const catalogService = require('./catalogService');
const locationRepository = require('../repositories/locationRepository');
const locationService = require('./locationService');
const userService = require('./userService');
const countryRepository = require('../repositories/countryRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const COUNTRY_LIST_CACHE_KEY = 'country:list';
const COUNTRY_DETAIL_CACHE_PREFIX = 'country:detail:';
const COUNTRY_CACHE_TTL_MS = Number(process.env.COUNTRY_CACHE_TTL_MS || 15000);
const countryQueryCache = new MemoryCache({ defaultTtlMs: COUNTRY_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCountryName(value) {
    return String(value || '').trim().toLowerCase();
}

function getCountryDetailCacheKey(idPais) {
    return `${COUNTRY_DETAIL_CACHE_PREFIX}${String(idPais).trim()}`;
}

function invalidateCountryCache(idPais) {
    countryQueryCache.delete(COUNTRY_LIST_CACHE_KEY);

    if (idPais !== undefined && idPais !== null) {
        countryQueryCache.delete(getCountryDetailCacheKey(idPais));
        return;
    }

    countryQueryCache.clearByPrefix(COUNTRY_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idPais = null) {
    invalidateCountryCache(idPais);
    locationService.invalidateCountriesCache();
    userService.invalidateAllUserCaches();
}

function formatCountry(country) {
    return {
        idPais: country.ID_PAIS,
        nombre: country.NOMBRE,
        idEstado: country.ID_ESTADO,
        estado: country.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCountryNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeCountryName(nombre);
    const countries = await getCountries();
    const duplicatedCountry = countries.find(
        (country) =>
            normalizeCountryName(country.nombre) === normalizedName &&
            Number(country.idPais) !== Number(excludeId)
    );

    if (duplicatedCountry) {
        throw createHttpError('Country name already exists', 409);
    }
}

async function getActiveProvincesCount(idPais) {
    const provinces = await locationRepository.findProvincesByCountry(idPais);
    return provinces.length;
}

async function ensureCountryCanBeDisabled(existingCountry, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingCountry.idEstado)) {
        return;
    }

    const activeProvincesCount = await getActiveProvincesCount(existingCountry.idPais);
    if (activeProvincesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a country that still has active provinces',
            409
        );
    }
}

async function ensureCountryCanBeDeleted(existingCountry) {
    if (isInactiveState(existingCountry.idEstado)) {
        throw createHttpError('Country is already inactive', 409);
    }

    const activeProvincesCount = await getActiveProvincesCount(existingCountry.idPais);
    if (activeProvincesCount > 0) {
        throw createHttpError(
            'Cannot delete a country that still has active provinces',
            409
        );
    }
}

async function getCountries() {
    return countryQueryCache.getOrSet(COUNTRY_LIST_CACHE_KEY, async () => {
        const countries = await countryRepository.findAllCountriesForAdmin();
        return countries.map(formatCountry);
    });
}

async function getCountryById(idPais) {
    return countryQueryCache.getOrSet(getCountryDetailCacheKey(idPais), async () => {
        const country = await countryRepository.findCountryById(idPais);

        if (!country) {
            throw createHttpError('Country not found', 404);
        }

        return formatCountry(country);
    });
}

async function createCountry(countryData) {
    const payload = {
        nombre: String(countryData.nombre || '').trim(),
        idEstado: Number(countryData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCountryNameIsAvailable(payload.nombre);

    const result = await countryRepository.createCountry(payload);
    invalidateRelatedCaches(result.idPais);

    return getCountryById(result.idPais);
}

async function updateCountry(idPais, countryData) {
    const existingCountry = await getCountryById(idPais);
    const payload = {
        idPais: Number(idPais),
        nombre: String(countryData.nombre || '').trim(),
        idEstado: Number(countryData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCountryNameIsAvailable(payload.nombre, { excludeId: payload.idPais });
    await ensureCountryCanBeDisabled(existingCountry, payload.idEstado);

    await countryRepository.updateCountry(payload);
    invalidateRelatedCaches(payload.idPais);

    return getCountryById(payload.idPais);
}

async function deleteCountry(idPais) {
    const existingCountry = await getCountryById(idPais);

    await ensureCountryCanBeDeleted(existingCountry);
    await countryRepository.deleteCountry(idPais);
    invalidateRelatedCaches(idPais);
}

module.exports = {
    getCountries,
    getCountryById,
    createCountry,
    updateCountry,
    deleteCountry
};
