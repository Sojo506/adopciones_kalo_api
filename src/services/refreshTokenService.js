const catalogService = require('./catalogService');
const refreshTokenRepository = require('../repositories/refreshTokenRepository');
const userRepository = require('../repositories/userRepository');
const MemoryCache = require('../utils/memoryCache');

const REFRESH_TOKEN_LIST_CACHE_KEY = 'refresh-token:list';
const REFRESH_TOKEN_DETAIL_CACHE_PREFIX = 'refresh-token:detail:';
const REFRESH_TOKEN_CACHE_TTL_MS = Number(process.env.REFRESH_TOKEN_CACHE_TTL_MS || 15000);
const refreshTokenQueryCache = new MemoryCache({ defaultTtlMs: REFRESH_TOKEN_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getRefreshTokenDetailCacheKey(idRefreshToken) {
    return `${REFRESH_TOKEN_DETAIL_CACHE_PREFIX}${String(idRefreshToken).trim()}`;
}

function invalidateRefreshTokenCache(idRefreshToken) {
    refreshTokenQueryCache.delete(REFRESH_TOKEN_LIST_CACHE_KEY);

    if (idRefreshToken !== undefined && idRefreshToken !== null) {
        refreshTokenQueryCache.delete(getRefreshTokenDetailCacheKey(idRefreshToken));
        return;
    }

    refreshTokenQueryCache.clearByPrefix(REFRESH_TOKEN_DETAIL_CACHE_PREFIX);
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue ? normalizedValue : null;
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

function formatRefreshToken(refreshToken) {
    return {
        idRefreshToken: refreshToken.ID_REFRESH_TOKEN,
        idCuenta: refreshToken.ID_CUENTA,
        usuario: refreshToken.USUARIO || null,
        tokenHash: refreshToken.TOKEN_HASH,
        jti: refreshToken.JTI || null,
        ipAddress: refreshToken.IP_ADDRESS || null,
        userAgent: refreshToken.USER_AGENT || null,
        fechaExpiracion: refreshToken.FECHA_EXPIRACION,
        fechaRevocacion: refreshToken.FECHA_REVOCACION || null,
        idEstado: refreshToken.ID_ESTADO,
        estado: refreshToken.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureAccountExists(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);

    if (!account) {
        throw createHttpError('Account not found', 404);
    }

    return account;
}

function normalizeRefreshTokenPayload(refreshTokenData) {
    return {
        idCuenta: Number(refreshTokenData.idCuenta),
        tokenHash: String(refreshTokenData.tokenHash || '').trim(),
        jti: normalizeOptionalText(refreshTokenData.jti),
        ipAddress: normalizeOptionalText(refreshTokenData.ipAddress),
        userAgent: normalizeOptionalText(refreshTokenData.userAgent),
        fechaExpiracion: parseDateValue(refreshTokenData.fechaExpiracion, 'Expiration date', { required: true }),
        fechaRevocacion: parseDateValue(refreshTokenData.fechaRevocacion, 'Revocation date'),
        idEstado: Number(refreshTokenData.idEstado)
    };
}

async function getRefreshTokens() {
    return refreshTokenQueryCache.getOrSet(REFRESH_TOKEN_LIST_CACHE_KEY, async () => {
        const refreshTokens = await refreshTokenRepository.findAllRefreshTokens();
        return refreshTokens.map((refreshToken) => formatRefreshToken(refreshToken));
    });
}

async function getRefreshTokenById(idRefreshToken) {
    return refreshTokenQueryCache.getOrSet(getRefreshTokenDetailCacheKey(idRefreshToken), async () => {
        const refreshToken = await refreshTokenRepository.findRefreshTokenById(idRefreshToken);

        if (!refreshToken) {
            throw createHttpError('Refresh token not found', 404);
        }

        return formatRefreshToken(refreshToken);
    });
}

async function createRefreshToken(refreshTokenData) {
    const payload = normalizeRefreshTokenPayload(refreshTokenData);

    if (!payload.tokenHash) {
        throw createHttpError('Token hash is required', 400);
    }

    await ensureAccountExists(payload.idCuenta);
    await ensureStateExists(payload.idEstado);

    const result = await refreshTokenRepository.createRefreshToken(payload);
    invalidateRefreshTokenCache(result.idRefreshToken);

    return getRefreshTokenById(result.idRefreshToken);
}

async function updateRefreshToken(idRefreshToken, refreshTokenData) {
    const normalizedIdRefreshToken = Number(idRefreshToken);
    await getRefreshTokenById(normalizedIdRefreshToken);

    const payload = normalizeRefreshTokenPayload(refreshTokenData);

    if (!payload.tokenHash) {
        throw createHttpError('Token hash is required', 400);
    }

    await ensureAccountExists(payload.idCuenta);
    await ensureStateExists(payload.idEstado);

    await refreshTokenRepository.updateRefreshToken({
        idRefreshToken: normalizedIdRefreshToken,
        ...payload
    });

    invalidateRefreshTokenCache(normalizedIdRefreshToken);
    return getRefreshTokenById(normalizedIdRefreshToken);
}

async function deleteRefreshToken(idRefreshToken) {
    const normalizedIdRefreshToken = Number(idRefreshToken);

    await getRefreshTokenById(normalizedIdRefreshToken);
    await refreshTokenRepository.deleteRefreshToken(normalizedIdRefreshToken);
    invalidateRefreshTokenCache(normalizedIdRefreshToken);
}

module.exports = {
    getRefreshTokens,
    getRefreshTokenById,
    createRefreshToken,
    updateRefreshToken,
    deleteRefreshToken
};
