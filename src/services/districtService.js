const addressRepository = require('../repositories/addressRepository');
const catalogService = require('./catalogService');
const cantonService = require('./cantonService');
const locationService = require('./locationService');
const districtRepository = require('../repositories/districtRepository');
const userService = require('./userService');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const DISTRICT_LIST_CACHE_KEY = 'district:list';
const DISTRICT_DETAIL_CACHE_PREFIX = 'district:detail:';
const DISTRICT_CACHE_TTL_MS = Number(process.env.DISTRICT_CACHE_TTL_MS || 15000);
const districtQueryCache = new MemoryCache({ defaultTtlMs: DISTRICT_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeDistrictName(value) {
    return String(value || '').trim().toLowerCase();
}

function getDistrictDetailCacheKey(idDistrito) {
    return `${DISTRICT_DETAIL_CACHE_PREFIX}${String(idDistrito).trim()}`;
}

function invalidateDistrictCache(idDistrito) {
    districtQueryCache.delete(DISTRICT_LIST_CACHE_KEY);

    if (idDistrito !== undefined && idDistrito !== null) {
        districtQueryCache.delete(getDistrictDetailCacheKey(idDistrito));
        return;
    }

    districtQueryCache.clearByPrefix(DISTRICT_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches({ idDistrito = null, idCanton = null } = {}) {
    invalidateDistrictCache(idDistrito);
    locationService.invalidateDistrictsCache(idCanton);
    userService.invalidateAllUserCaches();
}

function formatDistrict(district) {
    return {
        idDistrito: district.ID_DISTRITO,
        nombre: district.NOMBRE,
        idCanton: district.ID_CANTON,
        canton: district.CANTON,
        idEstado: district.ID_ESTADO,
        estado: district.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCantonExists(idCanton) {
    const canton = await cantonService.getCantonById(idCanton);
    return canton;
}

async function ensureDistrictNameIsAvailable(nombre, idCanton, { excludeId = null } = {}) {
    const normalizedName = normalizeDistrictName(nombre);
    const districts = await getDistricts();
    const duplicatedDistrict = districts.find(
        (district) =>
            normalizeDistrictName(district.nombre) === normalizedName &&
            Number(district.idCanton) === Number(idCanton) &&
            Number(district.idDistrito) !== Number(excludeId)
    );

    if (duplicatedDistrict) {
        throw createHttpError('District name already exists in the selected canton', 409);
    }
}

async function getActiveAddressesCount(idDistrito) {
    const addresses = await addressRepository.findAllAddresses();

    return addresses.filter(
        (address) =>
            Number(address.ID_DISTRITO) === Number(idDistrito) &&
            Number(address.ID_ESTADO) === 1
    ).length;
}

async function ensureDistrictCantonAssignmentIsValid(canton, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(canton.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a district active under an inactive canton',
            409
        );
    }
}

async function ensureDistrictCantonChangeIsSafe(existingDistrict, nextCantonId) {
    if (Number(existingDistrict.idCanton) === Number(nextCantonId)) {
        return;
    }

    const activeAddressesCount = await getActiveAddressesCount(existingDistrict.idDistrito);
    if (activeAddressesCount > 0) {
        throw createHttpError(
            'Cannot move a district to another canton while it still has active addresses',
            409
        );
    }
}

async function ensureDistrictCanBeDisabled(existingDistrict, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingDistrict.idEstado)) {
        return;
    }

    const activeAddressesCount = await getActiveAddressesCount(existingDistrict.idDistrito);
    if (activeAddressesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a district that still has active addresses',
            409
        );
    }
}

async function ensureDistrictCanBeDeleted(existingDistrict) {
    if (isInactiveState(existingDistrict.idEstado)) {
        throw createHttpError('District is already inactive', 409);
    }

    const activeAddressesCount = await getActiveAddressesCount(existingDistrict.idDistrito);
    if (activeAddressesCount > 0) {
        throw createHttpError(
            'Cannot delete a district that still has active addresses',
            409
        );
    }
}

async function getDistricts() {
    return districtQueryCache.getOrSet(DISTRICT_LIST_CACHE_KEY, async () => {
        const districts = await districtRepository.findAllDistricts();
        return districts.map(formatDistrict);
    });
}

async function getDistrictById(idDistrito) {
    return districtQueryCache.getOrSet(getDistrictDetailCacheKey(idDistrito), async () => {
        const district = await districtRepository.findDistrictById(idDistrito);

        if (!district) {
            throw createHttpError('District not found', 404);
        }

        return formatDistrict(district);
    });
}

async function createDistrict(districtData) {
    const payload = {
        nombre: String(districtData.nombre || '').trim(),
        idCanton: Number(districtData.idCanton),
        idEstado: Number(districtData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const canton = await ensureCantonExists(payload.idCanton);
    await ensureDistrictCantonAssignmentIsValid(canton, payload.idEstado);
    await ensureDistrictNameIsAvailable(payload.nombre, payload.idCanton);

    const result = await districtRepository.createDistrict(payload);
    invalidateRelatedCaches({
        idDistrito: result.idDistrito,
        idCanton: payload.idCanton
    });

    return getDistrictById(result.idDistrito);
}

async function updateDistrict(idDistrito, districtData) {
    const existingDistrict = await getDistrictById(idDistrito);
    const payload = {
        idDistrito: Number(idDistrito),
        nombre: String(districtData.nombre || '').trim(),
        idCanton: Number(districtData.idCanton),
        idEstado: Number(districtData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const canton = await ensureCantonExists(payload.idCanton);
    await ensureDistrictCantonAssignmentIsValid(canton, payload.idEstado);
    await ensureDistrictNameIsAvailable(payload.nombre, payload.idCanton, {
        excludeId: payload.idDistrito
    });
    await ensureDistrictCantonChangeIsSafe(existingDistrict, payload.idCanton);
    await ensureDistrictCanBeDisabled(existingDistrict, payload.idEstado);

    await districtRepository.updateDistrict(payload);
    locationService.invalidateDistrictsCache(existingDistrict.idCanton);
    invalidateRelatedCaches({
        idDistrito: payload.idDistrito,
        idCanton: payload.idCanton
    });

    return getDistrictById(payload.idDistrito);
}

async function deleteDistrict(idDistrito) {
    const existingDistrict = await getDistrictById(idDistrito);

    await ensureDistrictCanBeDeleted(existingDistrict);
    await districtRepository.deleteDistrict(idDistrito);
    invalidateRelatedCaches({
        idDistrito,
        idCanton: existingDistrict.idCanton
    });
}

module.exports = {
    getDistricts,
    getDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict
};
