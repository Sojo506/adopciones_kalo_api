const catalogService = require('./catalogService');
const emailRepository = require('../repositories/emailRepository');
const userRepository = require('../repositories/userRepository');
const userService = require('./userService');
const MemoryCache = require('../utils/memoryCache');

const EMAIL_LIST_CACHE_KEY = 'email:list';
const EMAIL_DETAIL_CACHE_PREFIX = 'email:detail:';
const EMAIL_CACHE_TTL_MS = Number(process.env.EMAIL_CACHE_TTL_MS || 15000);
const INACTIVE_STATE_ID = 2;
const emailQueryCache = new MemoryCache({ defaultTtlMs: EMAIL_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeEmailKey(identificacion, correo) {
    return `${String(identificacion).trim()}:${String(correo).trim().toLowerCase()}`;
}

function getEmailDetailCacheKey(identificacion, correo) {
    return `${EMAIL_DETAIL_CACHE_PREFIX}${normalizeEmailKey(identificacion, correo)}`;
}

function invalidateEmailCache(identificacion, correo) {
    emailQueryCache.delete(EMAIL_LIST_CACHE_KEY);

    if (identificacion !== undefined && identificacion !== null && correo) {
        emailQueryCache.delete(getEmailDetailCacheKey(identificacion, correo));
        return;
    }

    emailQueryCache.clearByPrefix(EMAIL_DETAIL_CACHE_PREFIX);
}

function formatEmail(email) {
    return {
        identificacion: email.IDENTIFICACION,
        usuario: email.USUARIO || null,
        correo: email.CORREO,
        idEstado: email.ID_ESTADO,
        estado: email.ESTADO
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureUserExists(identificacion) {
    const user = await userRepository.findByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return user;
}

async function hydrateEmail(email) {
    if (email.USUARIO) {
        return formatEmail(email);
    }

    const user = await userRepository.findByIdentification(email.IDENTIFICACION);

    return formatEmail({
        ...email,
        USUARIO: user?.USUARIO || null
    });
}

async function getEmails() {
    return emailQueryCache.getOrSet(EMAIL_LIST_CACHE_KEY, async () => {
        const emails = await emailRepository.findAllEmails();
        return emails.map(formatEmail);
    });
}

async function getEmailByPk(identificacion, correo) {
    return emailQueryCache.getOrSet(getEmailDetailCacheKey(identificacion, correo), async () => {
        const email = await emailRepository.findEmailByPk(identificacion, correo);

        if (!email) {
            throw createHttpError('Email not found', 404);
        }

        return hydrateEmail(email);
    });
}

async function createEmail(emailData) {
    const payload = {
        identificacion: Number(emailData.identificacion),
        correo: String(emailData.correo || '').trim(),
        idEstado: Number(emailData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserExists(payload.identificacion);

    const existingEmail = await emailRepository.findEmailByAddress(payload.correo);
    if (existingEmail) {
        throw createHttpError('Email already exists', 409);
    }

    await emailRepository.createEmail(payload);
    invalidateEmailCache(payload.identificacion, payload.correo);

    return getEmailByPk(payload.identificacion, payload.correo);
}

async function updateEmail(identificacion, correo, emailData) {
    const normalizedIdentificacion = Number(identificacion);
    const normalizedCorreo = String(correo || '').trim();
    const payload = {
        identificacion: normalizedIdentificacion,
        correo: normalizedCorreo,
        idEstado: Number(emailData.idEstado)
    };

    const existingEmail = await getEmailByPk(normalizedIdentificacion, normalizedCorreo);
    const linkedAccount = await userRepository.findAccountByIdentification(normalizedIdentificacion);

    await ensureStateExists(payload.idEstado);
    await emailRepository.updateEmail(payload);

    if (
        linkedAccount &&
        Number(payload.idEstado) === INACTIVE_STATE_ID &&
        Number(existingEmail.idEstado) !== INACTIVE_STATE_ID
    ) {
        await userService.forceLogoutAccountSessions(linkedAccount.ID_CUENTA, 'email_inactivated');
    }

    invalidateEmailCache(normalizedIdentificacion, normalizedCorreo);

    return getEmailByPk(normalizedIdentificacion, normalizedCorreo);
}

async function deleteEmail(identificacion, correo) {
    const normalizedIdentificacion = Number(identificacion);
    const normalizedCorreo = String(correo || '').trim();
    const existingEmail = await getEmailByPk(normalizedIdentificacion, normalizedCorreo);
    const linkedAccount = await userRepository.findAccountByIdentification(normalizedIdentificacion);

    await emailRepository.deleteEmail(normalizedIdentificacion, normalizedCorreo);

    if (linkedAccount && Number(existingEmail.idEstado) !== INACTIVE_STATE_ID) {
        await userService.forceLogoutAccountSessions(linkedAccount.ID_CUENTA, 'email_inactivated');
    }

    invalidateEmailCache(normalizedIdentificacion, normalizedCorreo);
}

module.exports = {
    getEmails,
    getEmailByPk,
    createEmail,
    updateEmail,
    deleteEmail
};
