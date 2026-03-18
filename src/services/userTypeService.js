const catalogService = require('./catalogService');
const userService = require('./userService');
const userRepository = require('../repositories/userRepository');
const userTypeRepository = require('../repositories/userTypeRepository');
const MemoryCache = require('../utils/memoryCache');

const USER_TYPE_LIST_CACHE_KEY = 'user-type:list';
const USER_TYPE_DETAIL_CACHE_PREFIX = 'user-type:detail:';
const USER_TYPE_CACHE_TTL_MS = Number(process.env.USER_TYPE_CACHE_TTL_MS || 15000);
const RESERVED_USER_TYPE_IDS = new Set([1, 2]);
const RESERVED_USER_TYPE_NAMES = new Set(['administrador', 'cliente']);
const userTypeQueryCache = new MemoryCache({ defaultTtlMs: USER_TYPE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeUserTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getUserTypeDetailCacheKey(idTipoUsuario) {
    return `${USER_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoUsuario).trim()}`;
}

function invalidateUserTypeCache(idTipoUsuario) {
    userTypeQueryCache.delete(USER_TYPE_LIST_CACHE_KEY);

    if (idTipoUsuario !== undefined && idTipoUsuario !== null) {
        userTypeQueryCache.delete(getUserTypeDetailCacheKey(idTipoUsuario));
    }
}

function formatUserType(userType) {
    return {
        idTipoUsuario: userType.ID_TIPO_USUARIO,
        nombre: userType.NOMBRE,
        idEstado: userType.ID_ESTADO,
        estado: userType.ESTADO
    };
}

function isReservedUserType(userType) {
    return (
        RESERVED_USER_TYPE_IDS.has(Number(userType.idTipoUsuario)) ||
        RESERVED_USER_TYPE_NAMES.has(normalizeUserTypeName(userType.nombre))
    );
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureUserTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeUserTypeName(nombre);
    const userTypes = await getUserTypes();
    const duplicatedUserType = userTypes.find(
        (userType) =>
            normalizeUserTypeName(userType.nombre) === normalizedName &&
            Number(userType.idTipoUsuario) !== Number(excludeId)
    );

    if (duplicatedUserType) {
        throw createHttpError('User type name already exists', 409);
    }
}

async function getAssignedUsersCount(idTipoUsuario) {
    const users = await userRepository.findAllUsers();

    return users.filter((user) => Number(user.ID_TIPO_USUARIO) === Number(idTipoUsuario)).length;
}

async function ensureReservedUserTypeRemainsStable(existingUserType, nextValues) {
    if (!isReservedUserType(existingUserType)) {
        return;
    }

    const currentName = normalizeUserTypeName(existingUserType.nombre);
    const nextName = normalizeUserTypeName(nextValues.nombre ?? existingUserType.nombre);
    const nextState = Number(nextValues.idEstado ?? existingUserType.idEstado);

    if (nextName !== currentName || nextState !== 1) {
        throw createHttpError(
            'The reserved user types "Administrador" and "Cliente" cannot be renamed or deactivated',
            409
        );
    }
}

async function ensureUserTypeCanBeDisabled(existingUserType, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    const assignedUsersCount = await getAssignedUsersCount(existingUserType.idTipoUsuario);
    if (assignedUsersCount > 0) {
        throw createHttpError(
            'Cannot deactivate a user type that is currently assigned to users',
            409
        );
    }
}

async function ensureUserTypeCanBeDeleted(existingUserType) {
    if (isReservedUserType(existingUserType)) {
        throw createHttpError(
            'The reserved user types "Administrador" and "Cliente" cannot be deleted',
            409
        );
    }

    const assignedUsersCount = await getAssignedUsersCount(existingUserType.idTipoUsuario);
    if (assignedUsersCount > 0) {
        throw createHttpError(
            'Cannot delete a user type that is currently assigned to users',
            409
        );
    }
}

function invalidateRelatedCaches(idTipoUsuario = null) {
    invalidateUserTypeCache(idTipoUsuario);
    catalogService.invalidateUserTypesCache();
    userService.invalidateAllUserCaches();
}

async function getUserTypes() {
    return userTypeQueryCache.getOrSet(USER_TYPE_LIST_CACHE_KEY, async () => {
        const userTypes = await userTypeRepository.findAllUserTypesForAdmin();
        return userTypes.map(formatUserType);
    });
}

async function getUserTypeById(idTipoUsuario) {
    return userTypeQueryCache.getOrSet(getUserTypeDetailCacheKey(idTipoUsuario), async () => {
        const userType = await userTypeRepository.findUserTypeById(idTipoUsuario);

        if (!userType) {
            throw createHttpError('User type not found', 404);
        }

        return formatUserType(userType);
    });
}

async function createUserType(userTypeData) {
    const payload = {
        nombre: String(userTypeData.nombre || '').trim(),
        idEstado: Number(userTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserTypeNameIsAvailable(payload.nombre);

    const result = await userTypeRepository.createUserType(payload);
    invalidateRelatedCaches(result.idTipoUsuario);

    return getUserTypeById(result.idTipoUsuario);
}

async function updateUserType(idTipoUsuario, userTypeData) {
    const existingUserType = await getUserTypeById(idTipoUsuario);
    const payload = {
        idTipoUsuario: Number(idTipoUsuario),
        nombre: String(userTypeData.nombre || '').trim(),
        idEstado: Number(userTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserTypeNameIsAvailable(payload.nombre, { excludeId: payload.idTipoUsuario });
    await ensureReservedUserTypeRemainsStable(existingUserType, payload);
    await ensureUserTypeCanBeDisabled(existingUserType, payload.idEstado);

    await userTypeRepository.updateUserType(payload);
    invalidateRelatedCaches(payload.idTipoUsuario);

    return getUserTypeById(payload.idTipoUsuario);
}

async function deleteUserType(idTipoUsuario) {
    const existingUserType = await getUserTypeById(idTipoUsuario);

    await ensureUserTypeCanBeDeleted(existingUserType);
    await userTypeRepository.deleteUserType(idTipoUsuario);
    invalidateRelatedCaches(idTipoUsuario);
}

module.exports = {
    getUserTypes,
    getUserTypeById,
    createUserType,
    updateUserType,
    deleteUserType
};
