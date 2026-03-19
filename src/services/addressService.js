const addressRepository = require('../repositories/addressRepository');
const catalogService = require('./catalogService');
const districtService = require('./districtService');
const fosterHomeRepository = require('../repositories/fosterHomeRepository');
const userRepository = require('../repositories/userRepository');
const MemoryCache = require('../utils/memoryCache');

const ADDRESS_LIST_CACHE_KEY = 'address:list';
const ADDRESS_DETAIL_CACHE_PREFIX = 'address:detail:';
const ADDRESS_CACHE_TTL_MS = Number(process.env.ADDRESS_CACHE_TTL_MS || 15000);
const addressQueryCache = new MemoryCache({ defaultTtlMs: ADDRESS_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue ? normalizedValue : null;
}

function getAddressDetailCacheKey(idDireccion) {
    return `${ADDRESS_DETAIL_CACHE_PREFIX}${String(idDireccion).trim()}`;
}

function invalidateAddressCache(idDireccion) {
    addressQueryCache.delete(ADDRESS_LIST_CACHE_KEY);

    if (idDireccion !== undefined && idDireccion !== null) {
        addressQueryCache.delete(getAddressDetailCacheKey(idDireccion));
        return;
    }

    addressQueryCache.clearByPrefix(ADDRESS_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idDireccion = null) {
    invalidateAddressCache(idDireccion);
    const userService = require('./userService');
    userService.invalidateAllUserCaches();
}

function formatAddress(address) {
    return {
        idDireccion: address.ID_DIRECCION,
        idDistrito: address.ID_DISTRITO,
        distrito: address.DISTRITO,
        idCanton: address.ID_CANTON,
        canton: address.CANTON,
        idProvincia: address.ID_PROVINCIA,
        provincia: address.PROVINCIA,
        idPais: address.ID_PAIS,
        pais: address.PAIS,
        calle: address.CALLE || null,
        numero: address.NUMERO || null,
        idEstado: address.ID_ESTADO,
        estado: address.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureDistrictExists(idDistrito) {
    const district = await districtService.getDistrictById(idDistrito);
    return district;
}

async function getActiveUsersCount(idDireccion) {
    const users = await userRepository.findAllUsers();

    return users.filter(
        (user) =>
            Number(user.ID_DIRECCION) === Number(idDireccion) &&
            Number(user.ID_ESTADO) === 1
    ).length;
}

async function getActiveFosterHomesCount(idDireccion) {
    const fosterHomes = await fosterHomeRepository.findAllFosterHomes();

    return fosterHomes.filter(
        (fosterHome) =>
            Number(fosterHome.ID_DIRECCION) === Number(idDireccion) &&
            Number(fosterHome.ID_ESTADO) === 1
    ).length;
}

async function ensureAddressDistrictAssignmentIsValid(district, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(district.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep an address active under an inactive district',
            409
        );
    }
}

async function ensureAddressCanBeDisabled(existingAddress, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingAddress.idEstado) !== 1) {
        return;
    }

    const [activeUsersCount, activeFosterHomesCount] = await Promise.all([
        getActiveUsersCount(existingAddress.idDireccion),
        getActiveFosterHomesCount(existingAddress.idDireccion)
    ]);

    if (activeUsersCount > 0 || activeFosterHomesCount > 0) {
        throw createHttpError(
            'Cannot deactivate an address that is still assigned to active users or foster homes',
            409
        );
    }
}

async function ensureAddressCanBeDeleted(existingAddress) {
    if (Number(existingAddress.idEstado) !== 1) {
        throw createHttpError('Address is already inactive', 409);
    }

    const [activeUsersCount, activeFosterHomesCount] = await Promise.all([
        getActiveUsersCount(existingAddress.idDireccion),
        getActiveFosterHomesCount(existingAddress.idDireccion)
    ]);

    if (activeUsersCount > 0 || activeFosterHomesCount > 0) {
        throw createHttpError(
            'Cannot delete an address that is still assigned to active users or foster homes',
            409
        );
    }
}

async function createAddress(addressData) {
    const payload = {
        idDistrito: Number(addressData.idDistrito),
        calle: normalizeOptionalText(addressData.calle),
        numero: normalizeOptionalText(addressData.numero),
        idEstado: Number(addressData.idEstado || 1)
    };

    await ensureStateExists(payload.idEstado);
    const district = await ensureDistrictExists(payload.idDistrito);
    await ensureAddressDistrictAssignmentIsValid(district, payload.idEstado);

    const result = await addressRepository.createAddress(payload);
    invalidateRelatedCaches(result.idDireccion);

    return getAddressById(result.idDireccion);
}

async function getAddresses() {
    return addressQueryCache.getOrSet(ADDRESS_LIST_CACHE_KEY, async () => {
        const addresses = await addressRepository.findAllAddresses();
        return addresses.map(formatAddress);
    });
}

async function getAddressById(idDireccion) {
    return addressQueryCache.getOrSet(getAddressDetailCacheKey(idDireccion), async () => {
        const address = await addressRepository.findAddressById(idDireccion);

        if (!address) {
            throw createHttpError('Address not found', 404);
        }

        return formatAddress(address);
    });
}

async function updateAddress(idDireccion, addressData) {
    const existingAddress = await getAddressById(idDireccion);
    const payload = {
        idDireccion: Number(idDireccion),
        idDistrito: Number(addressData.idDistrito),
        calle: normalizeOptionalText(addressData.calle),
        numero: normalizeOptionalText(addressData.numero),
        idEstado: Number(addressData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const district = await ensureDistrictExists(payload.idDistrito);
    await ensureAddressDistrictAssignmentIsValid(district, payload.idEstado);
    await ensureAddressCanBeDisabled(existingAddress, payload.idEstado);

    await addressRepository.updateAddress(payload);
    invalidateRelatedCaches(payload.idDireccion);

    return getAddressById(payload.idDireccion);
}

async function deleteAddress(idDireccion) {
    const existingAddress = await getAddressById(idDireccion);

    await ensureAddressCanBeDeleted(existingAddress);
    await addressRepository.deleteAddress(idDireccion);
    invalidateRelatedCaches(idDireccion);
}

module.exports = {
    createAddress,
    getAddresses,
    getAddressById,
    updateAddress,
    deleteAddress
};
