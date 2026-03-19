const catalogService = require('./catalogService');
const locationRepository = require('../repositories/locationRepository');
const locationService = require('./locationService');
const provinceService = require('./provinceService');
const cantonRepository = require('../repositories/cantonRepository');
const userService = require('./userService');
const MemoryCache = require('../utils/memoryCache');

const CANTON_LIST_CACHE_KEY = 'canton:list';
const CANTON_DETAIL_CACHE_PREFIX = 'canton:detail:';
const CANTON_CACHE_TTL_MS = Number(process.env.CANTON_CACHE_TTL_MS || 15000);
const cantonQueryCache = new MemoryCache({ defaultTtlMs: CANTON_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCantonName(value) {
    return String(value || '').trim().toLowerCase();
}

function getCantonDetailCacheKey(idCanton) {
    return `${CANTON_DETAIL_CACHE_PREFIX}${String(idCanton).trim()}`;
}

function invalidateCantonCache(idCanton) {
    cantonQueryCache.delete(CANTON_LIST_CACHE_KEY);

    if (idCanton !== undefined && idCanton !== null) {
        cantonQueryCache.delete(getCantonDetailCacheKey(idCanton));
        return;
    }

    cantonQueryCache.clearByPrefix(CANTON_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idCanton = null) {
    invalidateCantonCache(idCanton);
    locationService.invalidateCantonsCache();
    userService.invalidateAllUserCaches();
}

function formatCanton(canton) {
    return {
        idCanton: canton.ID_CANTON,
        nombre: canton.NOMBRE,
        idProvincia: canton.ID_PROVINCIA,
        provincia: canton.PROVINCIA,
        idEstado: canton.ID_ESTADO,
        estado: canton.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureProvinceExists(idProvincia) {
    const province = await provinceService.getProvinceById(idProvincia);
    return province;
}

async function ensureCantonNameIsAvailable(nombre, idProvincia, { excludeId = null } = {}) {
    const normalizedName = normalizeCantonName(nombre);
    const cantons = await getCantons();
    const duplicatedCanton = cantons.find(
        (canton) =>
            normalizeCantonName(canton.nombre) === normalizedName &&
            Number(canton.idProvincia) === Number(idProvincia) &&
            Number(canton.idCanton) !== Number(excludeId)
    );

    if (duplicatedCanton) {
        throw createHttpError('Canton name already exists in the selected province', 409);
    }
}

async function getActiveDistrictsCount(idCanton) {
    const districts = await locationRepository.findDistrictsByCanton(idCanton);
    return districts.length;
}

async function ensureCantonProvinceAssignmentIsValid(province, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(province.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a canton active under an inactive province',
            409
        );
    }
}

async function ensureCantonProvinceChangeIsSafe(existingCanton, nextProvinceId) {
    if (Number(existingCanton.idProvincia) === Number(nextProvinceId)) {
        return;
    }

    const activeDistrictsCount = await getActiveDistrictsCount(existingCanton.idCanton);
    if (activeDistrictsCount > 0) {
        throw createHttpError(
            'Cannot move a canton to another province while it still has active districts',
            409
        );
    }
}

async function ensureCantonCanBeDisabled(existingCanton, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingCanton.idEstado) !== 1) {
        return;
    }

    const activeDistrictsCount = await getActiveDistrictsCount(existingCanton.idCanton);
    if (activeDistrictsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a canton that still has active districts',
            409
        );
    }
}

async function ensureCantonCanBeDeleted(existingCanton) {
    if (Number(existingCanton.idEstado) !== 1) {
        throw createHttpError('Canton is already inactive', 409);
    }

    const activeDistrictsCount = await getActiveDistrictsCount(existingCanton.idCanton);
    if (activeDistrictsCount > 0) {
        throw createHttpError(
            'Cannot delete a canton that still has active districts',
            409
        );
    }
}

async function getCantons() {
    return cantonQueryCache.getOrSet(CANTON_LIST_CACHE_KEY, async () => {
        const cantons = await cantonRepository.findAllCantons();
        return cantons.map(formatCanton);
    });
}

async function getCantonById(idCanton) {
    return cantonQueryCache.getOrSet(getCantonDetailCacheKey(idCanton), async () => {
        const canton = await cantonRepository.findCantonById(idCanton);

        if (!canton) {
            throw createHttpError('Canton not found', 404);
        }

        return formatCanton(canton);
    });
}

async function createCanton(cantonData) {
    const payload = {
        nombre: String(cantonData.nombre || '').trim(),
        idProvincia: Number(cantonData.idProvincia),
        idEstado: Number(cantonData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const province = await ensureProvinceExists(payload.idProvincia);
    await ensureCantonProvinceAssignmentIsValid(province, payload.idEstado);
    await ensureCantonNameIsAvailable(payload.nombre, payload.idProvincia);

    const result = await cantonRepository.createCanton(payload);
    invalidateRelatedCaches(result.idCanton);

    return getCantonById(result.idCanton);
}

async function updateCanton(idCanton, cantonData) {
    const existingCanton = await getCantonById(idCanton);
    const payload = {
        idCanton: Number(idCanton),
        nombre: String(cantonData.nombre || '').trim(),
        idProvincia: Number(cantonData.idProvincia),
        idEstado: Number(cantonData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const province = await ensureProvinceExists(payload.idProvincia);
    await ensureCantonProvinceAssignmentIsValid(province, payload.idEstado);
    await ensureCantonNameIsAvailable(payload.nombre, payload.idProvincia, {
        excludeId: payload.idCanton
    });
    await ensureCantonProvinceChangeIsSafe(existingCanton, payload.idProvincia);
    await ensureCantonCanBeDisabled(existingCanton, payload.idEstado);

    await cantonRepository.updateCanton(payload);
    invalidateRelatedCaches(payload.idCanton);

    return getCantonById(payload.idCanton);
}

async function deleteCanton(idCanton) {
    const existingCanton = await getCantonById(idCanton);

    await ensureCantonCanBeDeleted(existingCanton);
    await cantonRepository.deleteCanton(idCanton);
    invalidateRelatedCaches(idCanton);
}

module.exports = {
    getCantons,
    getCantonById,
    createCanton,
    updateCanton,
    deleteCanton
};
