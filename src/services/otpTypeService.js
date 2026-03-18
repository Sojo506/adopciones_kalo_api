const catalogService = require('./catalogService');
const otpService = require('./otpService');
const otpTypeRepository = require('../repositories/otpTypeRepository');
const MemoryCache = require('../utils/memoryCache');

const OTP_TYPE_LIST_CACHE_KEY = 'otp-type:list';
const OTP_TYPE_DETAIL_CACHE_PREFIX = 'otp-type:detail:';
const OTP_TYPE_CACHE_TTL_MS = Number(process.env.OTP_TYPE_CACHE_TTL_MS || 15000);
const otpTypeQueryCache = new MemoryCache({ defaultTtlMs: OTP_TYPE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeOtpTypeName(value) {
    return String(value || '').trim().toLowerCase();
}

function getOtpTypeDetailCacheKey(idTipoOtp) {
    return `${OTP_TYPE_DETAIL_CACHE_PREFIX}${String(idTipoOtp).trim()}`;
}

function invalidateOtpTypeCache(idTipoOtp) {
    otpTypeQueryCache.delete(OTP_TYPE_LIST_CACHE_KEY);

    if (idTipoOtp !== undefined && idTipoOtp !== null) {
        otpTypeQueryCache.delete(getOtpTypeDetailCacheKey(idTipoOtp));
        return;
    }

    otpTypeQueryCache.clearByPrefix(OTP_TYPE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idTipoOtp = null) {
    invalidateOtpTypeCache(idTipoOtp);
    catalogService.invalidateOtpTypesCache();
    otpService.invalidateAllOtpCaches();
}

function formatOtpType(otpType) {
    return {
        idTipoOtp: otpType.ID_TIPO_OTP,
        nombre: otpType.NOMBRE,
        idEstado: otpType.ID_ESTADO,
        estado: otpType.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureOtpTypeNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeOtpTypeName(nombre);
    const otpTypes = await getOtpTypes();
    const duplicatedOtpType = otpTypes.find(
        (otpType) =>
            normalizeOtpTypeName(otpType.nombre) === normalizedName &&
            Number(otpType.idTipoOtp) !== Number(excludeId)
    );

    if (duplicatedOtpType) {
        throw createHttpError('OTP type name already exists', 409);
    }
}

async function getOtpTypes() {
    return otpTypeQueryCache.getOrSet(OTP_TYPE_LIST_CACHE_KEY, async () => {
        const otpTypes = await otpTypeRepository.findAllOtpTypesForAdmin();
        return otpTypes.map(formatOtpType);
    });
}

async function getOtpTypeById(idTipoOtp) {
    return otpTypeQueryCache.getOrSet(getOtpTypeDetailCacheKey(idTipoOtp), async () => {
        const otpType = await otpTypeRepository.findOtpTypeById(idTipoOtp);

        if (!otpType) {
            throw createHttpError('OTP type not found', 404);
        }

        return formatOtpType(otpType);
    });
}

async function createOtpType(otpTypeData) {
    const payload = {
        nombre: String(otpTypeData.nombre || '').trim(),
        idEstado: Number(otpTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureOtpTypeNameIsAvailable(payload.nombre);

    const result = await otpTypeRepository.createOtpType(payload);
    invalidateRelatedCaches(result.idTipoOtp);

    return getOtpTypeById(result.idTipoOtp);
}

async function updateOtpType(idTipoOtp, otpTypeData) {
    const normalizedIdTipoOtp = Number(idTipoOtp);
    await getOtpTypeById(normalizedIdTipoOtp);

    const payload = {
        idTipoOtp: normalizedIdTipoOtp,
        nombre: String(otpTypeData.nombre || '').trim(),
        idEstado: Number(otpTypeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureOtpTypeNameIsAvailable(payload.nombre, {
        excludeId: payload.idTipoOtp
    });

    await otpTypeRepository.updateOtpType(payload);
    invalidateRelatedCaches(payload.idTipoOtp);

    return getOtpTypeById(payload.idTipoOtp);
}

async function deleteOtpType(idTipoOtp) {
    const normalizedIdTipoOtp = Number(idTipoOtp);
    await getOtpTypeById(normalizedIdTipoOtp);
    await otpTypeRepository.deleteOtpType(normalizedIdTipoOtp);
    invalidateRelatedCaches(normalizedIdTipoOtp);
}

module.exports = {
    getOtpTypes,
    getOtpTypeById,
    createOtpType,
    updateOtpType,
    deleteOtpType
};
