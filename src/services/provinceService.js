const catalogService = require('./catalogService');
const countryService = require('./countryService');
const locationRepository = require('../repositories/locationRepository');
const locationService = require('./locationService');
const provinceRepository = require('../repositories/provinceRepository');
const userService = require('./userService');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const PROVINCE_LIST_CACHE_KEY = 'province:list';
const PROVINCE_DETAIL_CACHE_PREFIX = 'province:detail:';
const PROVINCE_CACHE_TTL_MS = Number(process.env.PROVINCE_CACHE_TTL_MS || 15000);
const provinceQueryCache = new MemoryCache({ defaultTtlMs: PROVINCE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeProvinceName(value) {
    return String(value || '').trim().toLowerCase();
}

function getProvinceDetailCacheKey(idProvincia) {
    return `${PROVINCE_DETAIL_CACHE_PREFIX}${String(idProvincia).trim()}`;
}

function invalidateProvinceCache(idProvincia) {
    provinceQueryCache.delete(PROVINCE_LIST_CACHE_KEY);

    if (idProvincia !== undefined && idProvincia !== null) {
        provinceQueryCache.delete(getProvinceDetailCacheKey(idProvincia));
        return;
    }

    provinceQueryCache.clearByPrefix(PROVINCE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idProvincia = null) {
    invalidateProvinceCache(idProvincia);
    locationService.invalidateProvincesCache();
    userService.invalidateAllUserCaches();
}

function formatProvince(province) {
    return {
        idProvincia: province.ID_PROVINCIA,
        nombre: province.NOMBRE,
        idPais: province.ID_PAIS,
        pais: province.PAIS,
        idEstado: province.ID_ESTADO,
        estado: province.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCountryExists(idPais) {
    const country = await countryService.getCountryById(idPais);
    return country;
}

async function ensureProvinceNameIsAvailable(nombre, idPais, { excludeId = null } = {}) {
    const normalizedName = normalizeProvinceName(nombre);
    const provinces = await getProvinces();
    const duplicatedProvince = provinces.find(
        (province) =>
            normalizeProvinceName(province.nombre) === normalizedName &&
            Number(province.idPais) === Number(idPais) &&
            Number(province.idProvincia) !== Number(excludeId)
    );

    if (duplicatedProvince) {
        throw createHttpError('Province name already exists in the selected country', 409);
    }
}

async function getActiveCantonsCount(idProvincia) {
    const cantons = await locationRepository.findCantonsByProvince(idProvincia);
    return cantons.length;
}

async function ensureProvinceCountryAssignmentIsValid(country, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(country.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a province active under an inactive country',
            409
        );
    }
}

async function ensureProvinceCountryChangeIsSafe(existingProvince, nextCountryId) {
    if (Number(existingProvince.idPais) === Number(nextCountryId)) {
        return;
    }

    const activeCantonsCount = await getActiveCantonsCount(existingProvince.idProvincia);
    if (activeCantonsCount > 0) {
        throw createHttpError(
            'Cannot move a province to another country while it still has active cantons',
            409
        );
    }
}

async function ensureProvinceCanBeDisabled(existingProvince, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingProvince.idEstado)) {
        return;
    }

    const activeCantonsCount = await getActiveCantonsCount(existingProvince.idProvincia);
    if (activeCantonsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a province that still has active cantons',
            409
        );
    }
}

async function ensureProvinceCanBeDeleted(existingProvince) {
    if (isInactiveState(existingProvince.idEstado)) {
        throw createHttpError('Province is already inactive', 409);
    }

    const activeCantonsCount = await getActiveCantonsCount(existingProvince.idProvincia);
    if (activeCantonsCount > 0) {
        throw createHttpError(
            'Cannot delete a province that still has active cantons',
            409
        );
    }
}

async function getProvinces() {
    return provinceQueryCache.getOrSet(PROVINCE_LIST_CACHE_KEY, async () => {
        const provinces = await provinceRepository.findAllProvinces();
        return provinces.map(formatProvince);
    });
}

async function getProvinceById(idProvincia) {
    return provinceQueryCache.getOrSet(getProvinceDetailCacheKey(idProvincia), async () => {
        const province = await provinceRepository.findProvinceById(idProvincia);

        if (!province) {
            throw createHttpError('Province not found', 404);
        }

        return formatProvince(province);
    });
}

async function createProvince(provinceData) {
    const payload = {
        nombre: String(provinceData.nombre || '').trim(),
        idPais: Number(provinceData.idPais),
        idEstado: Number(provinceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const country = await ensureCountryExists(payload.idPais);
    await ensureProvinceCountryAssignmentIsValid(country, payload.idEstado);
    await ensureProvinceNameIsAvailable(payload.nombre, payload.idPais);

    const result = await provinceRepository.createProvince(payload);
    invalidateRelatedCaches(result.idProvincia);

    return getProvinceById(result.idProvincia);
}

async function updateProvince(idProvincia, provinceData) {
    const existingProvince = await getProvinceById(idProvincia);
    const payload = {
        idProvincia: Number(idProvincia),
        nombre: String(provinceData.nombre || '').trim(),
        idPais: Number(provinceData.idPais),
        idEstado: Number(provinceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const country = await ensureCountryExists(payload.idPais);
    await ensureProvinceCountryAssignmentIsValid(country, payload.idEstado);
    await ensureProvinceNameIsAvailable(payload.nombre, payload.idPais, {
        excludeId: payload.idProvincia
    });
    await ensureProvinceCountryChangeIsSafe(existingProvince, payload.idPais);
    await ensureProvinceCanBeDisabled(existingProvince, payload.idEstado);

    await provinceRepository.updateProvince(payload);
    invalidateRelatedCaches(payload.idProvincia);

    return getProvinceById(payload.idProvincia);
}

async function deleteProvince(idProvincia) {
    const existingProvince = await getProvinceById(idProvincia);

    await ensureProvinceCanBeDeleted(existingProvince);
    await provinceRepository.deleteProvince(idProvincia);
    invalidateRelatedCaches(idProvincia);
}

module.exports = {
    getProvinces,
    getProvinceById,
    createProvince,
    updateProvince,
    deleteProvince
};
