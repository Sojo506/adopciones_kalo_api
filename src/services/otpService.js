const catalogService = require('./catalogService');
const otpRepository = require('../repositories/otpRepository');
const userRepository = require('../repositories/userRepository');
const MemoryCache = require('../utils/memoryCache');

const OTP_LIST_CACHE_KEY = 'otp:list';
const OTP_DETAIL_CACHE_PREFIX = 'otp:detail:';
const OTP_CACHE_TTL_MS = Number(process.env.OTP_CACHE_TTL_MS || 15000);
const otpQueryCache = new MemoryCache({ defaultTtlMs: OTP_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getOtpDetailCacheKey(idCodigoOtp) {
    return `${OTP_DETAIL_CACHE_PREFIX}${String(idCodigoOtp).trim()}`;
}

function invalidateOtpCache(idCodigoOtp) {
    otpQueryCache.delete(OTP_LIST_CACHE_KEY);

    if (idCodigoOtp !== undefined && idCodigoOtp !== null) {
        otpQueryCache.delete(getOtpDetailCacheKey(idCodigoOtp));
        return;
    }

    otpQueryCache.clearByPrefix(OTP_DETAIL_CACHE_PREFIX);
}

function parseDateValue(value, fieldLabel, { required = false } = {}) {
    if (value === undefined || value === null || value === '') {
        if (required) {
            throw createHttpError(`${fieldLabel} is required`, 400);
        }

        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedDate;
}

function validateOtpDates(payload) {
    if (payload.fechaExpiracion.getTime() < payload.fechaCreacion.getTime()) {
        throw createHttpError('Expiration date cannot be earlier than creation date', 400);
    }

    if (payload.fechaUso && payload.fechaUso.getTime() < payload.fechaCreacion.getTime()) {
        throw createHttpError('Usage date cannot be earlier than creation date', 400);
    }
}

function formatOtp(otp) {
    return {
        idCodigoOtp: otp.ID_CODIGO_OTP,
        idCuenta: otp.ID_CUENTA,
        usuario: otp.USUARIO || null,
        idTipoOtp: otp.ID_TIPO_OTP,
        tipoOtp: otp.TIPO_OTP || null,
        codigoHash: otp.CODIGO_HASH,
        fechaExpiracion: otp.FECHA_EXPIRACION,
        fechaUso: otp.FECHA_USO || null,
        intentos: otp.INTENTOS,
        fechaCreacion: otp.FECHA_CREACION,
        idEstado: otp.ID_ESTADO,
        estado: otp.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureOtpTypeExists(idTipoOtp) {
    const otpType = await catalogService.getOtpTypeById(idTipoOtp);

    if (!otpType) {
        throw createHttpError('OTP type not found', 400);
    }

    return otpType;
}

async function ensureAccountExists(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);

    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    return account;
}

function normalizeOtpPayload(otpData, { requireDates = true } = {}) {
    const payload = {
        idCuenta: Number(otpData.idCuenta),
        idTipoOtp: Number(otpData.idTipoOtp),
        codigoHash: String(otpData.codigoHash || '').trim(),
        fechaExpiracion: parseDateValue(otpData.fechaExpiracion, 'Expiration date', { required: requireDates }),
        fechaUso: parseDateValue(otpData.fechaUso, 'Usage date'),
        intentos: Number(otpData.intentos),
        fechaCreacion: parseDateValue(otpData.fechaCreacion, 'Creation date', { required: requireDates }),
        idEstado: Number(otpData.idEstado)
    };

    validateOtpDates(payload);

    return payload;
}

async function getOtps() {
    return otpQueryCache.getOrSet(OTP_LIST_CACHE_KEY, async () => {
        const otps = await otpRepository.findAllOtps();
        return otps.map((otp) => formatOtp(otp));
    });
}

async function getOtpById(idCodigoOtp) {
    return otpQueryCache.getOrSet(getOtpDetailCacheKey(idCodigoOtp), async () => {
        const otp = await otpRepository.findOtpById(idCodigoOtp);

        if (!otp) {
            throw createHttpError('OTP not found', 404);
        }

        return formatOtp(otp);
    });
}

async function createOtp(otpData) {
    const payload = normalizeOtpPayload(otpData);

    await ensureAccountExists(payload.idCuenta);
    await ensureOtpTypeExists(payload.idTipoOtp);
    await ensureStateExists(payload.idEstado);

    const result = await otpRepository.createOtp(payload);
    invalidateOtpCache(result.idCodigoOtp);

    return getOtpById(result.idCodigoOtp);
}

async function updateOtp(idCodigoOtp, otpData) {
    const normalizedIdCodigoOtp = Number(idCodigoOtp);

    await getOtpById(normalizedIdCodigoOtp);

    const payload = normalizeOtpPayload(otpData);
    await ensureAccountExists(payload.idCuenta);
    await ensureOtpTypeExists(payload.idTipoOtp);
    await ensureStateExists(payload.idEstado);

    await otpRepository.updateOtp({
        idCodigoOtp: normalizedIdCodigoOtp,
        ...payload
    });

    invalidateOtpCache(normalizedIdCodigoOtp);
    return getOtpById(normalizedIdCodigoOtp);
}

async function deleteOtp(idCodigoOtp) {
    const normalizedIdCodigoOtp = Number(idCodigoOtp);

    await getOtpById(normalizedIdCodigoOtp);
    await otpRepository.deleteOtp(normalizedIdCodigoOtp);
    invalidateOtpCache(normalizedIdCodigoOtp);
}

module.exports = {
    getOtps,
    getOtpById,
    createOtp,
    updateOtp,
    deleteOtp,
    invalidateAllOtpCaches: invalidateOtpCache
};
