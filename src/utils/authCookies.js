const REFRESH_TOKEN_COOKIE_NAME = process.env.REFRESH_TOKEN_COOKIE_NAME || 'refreshToken';
const REFRESH_TOKEN_COOKIE_PATH = process.env.REFRESH_TOKEN_COOKIE_PATH || '/api/auth';
const REFRESH_TOKEN_COOKIE_SAMESITE = process.env.REFRESH_TOKEN_COOKIE_SAMESITE || 'lax';
const REFRESH_TOKEN_COOKIE_SECURE =
    process.env.REFRESH_TOKEN_COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production';

function normalizeHeaderValue(value, maxLength) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return null;
    }

    return normalizedValue.slice(0, maxLength);
}

function parseCookieHeader(headerValue = '') {
    return String(headerValue)
        .split(';')
        .map((cookiePair) => cookiePair.trim())
        .filter(Boolean)
        .reduce((cookies, cookiePair) => {
            const separatorIndex = cookiePair.indexOf('=');

            if (separatorIndex === -1) {
                return cookies;
            }

            const cookieName = cookiePair.slice(0, separatorIndex).trim();
            const cookieValue = cookiePair.slice(separatorIndex + 1).trim();

            if (cookieName) {
                cookies[cookieName] = decodeURIComponent(cookieValue);
            }

            return cookies;
        }, {});
}

function getCookieValue(req, cookieName) {
    return parseCookieHeader(req?.headers?.cookie)[cookieName] || null;
}

function getRefreshTokenCookieOptions(expiresAt) {
    return {
        httpOnly: true,
        sameSite: REFRESH_TOKEN_COOKIE_SAMESITE,
        secure: REFRESH_TOKEN_COOKIE_SECURE,
        path: REFRESH_TOKEN_COOKIE_PATH,
        expires: expiresAt
    };
}

function getRefreshTokenClearCookieOptions() {
    return {
        httpOnly: true,
        sameSite: REFRESH_TOKEN_COOKIE_SAMESITE,
        secure: REFRESH_TOKEN_COOKIE_SECURE,
        path: REFRESH_TOKEN_COOKIE_PATH
    };
}

function getRequestMetadata(req) {
    const forwardedForHeader = req?.headers?.['x-forwarded-for'];
    const forwardedForValue = Array.isArray(forwardedForHeader)
        ? forwardedForHeader[0]
        : forwardedForHeader;
    const rawIpAddress = String(
        forwardedForValue ||
        req?.ip ||
        req?.socket?.remoteAddress ||
        ''
    )
        .split(',')[0]
        .trim();

    return {
        ipAddress: normalizeHeaderValue(rawIpAddress, 100),
        userAgent: normalizeHeaderValue(req?.headers?.['user-agent'], 300)
    };
}

module.exports = {
    REFRESH_TOKEN_COOKIE_NAME,
    getCookieValue,
    getRefreshTokenCookieOptions,
    getRefreshTokenClearCookieOptions,
    getRequestMetadata
};
