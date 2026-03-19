const catalogService = require('./catalogService');
const phoneRepository = require('../repositories/phoneRepository');
const userRepository = require('../repositories/userRepository');
const MemoryCache = require('../utils/memoryCache');

const PHONE_LIST_CACHE_KEY = 'phone:list';
const PHONE_DETAIL_CACHE_PREFIX = 'phone:detail:';
const PHONE_CACHE_TTL_MS = Number(process.env.PHONE_CACHE_TTL_MS || 15000);
const phoneQueryCache = new MemoryCache({ defaultTtlMs: PHONE_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizePhoneKey(identificacion, telefono) {
    return `${String(identificacion).trim()}:${String(telefono).trim()}`;
}

function getPhoneDetailCacheKey(identificacion, telefono) {
    return `${PHONE_DETAIL_CACHE_PREFIX}${normalizePhoneKey(identificacion, telefono)}`;
}

function invalidatePhoneCache(identificacion, telefono) {
    phoneQueryCache.delete(PHONE_LIST_CACHE_KEY);

    if (identificacion !== undefined && identificacion !== null && telefono) {
        phoneQueryCache.delete(getPhoneDetailCacheKey(identificacion, telefono));
        return;
    }

    phoneQueryCache.clearByPrefix(PHONE_DETAIL_CACHE_PREFIX);
}

function formatPhone(phone) {
    return {
        identificacion: phone.IDENTIFICACION,
        usuario: phone.USUARIO || null,
        telefono: phone.TELEFONO,
        idEstado: phone.ID_ESTADO,
        estado: phone.ESTADO
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

async function hydratePhone(phone) {
    if (phone.USUARIO) {
        return formatPhone(phone);
    }

    const user = await userRepository.findByIdentification(phone.IDENTIFICACION);

    return formatPhone({
        ...phone,
        USUARIO: user?.USUARIO || null
    });
}

async function getPhones() {
    return phoneQueryCache.getOrSet(PHONE_LIST_CACHE_KEY, async () => {
        const phones = await phoneRepository.findAllPhones();
        return phones.map(formatPhone);
    });
}

async function getPhoneByPk(identificacion, telefono) {
    return phoneQueryCache.getOrSet(getPhoneDetailCacheKey(identificacion, telefono), async () => {
        const phone = await phoneRepository.findPhoneByPk(identificacion, telefono);

        if (!phone) {
            throw createHttpError('Phone not found', 404);
        }

        return hydratePhone(phone);
    });
}

async function createPhone(phoneData) {
    const payload = {
        identificacion: Number(phoneData.identificacion),
        telefono: String(phoneData.telefono || '').trim(),
        idEstado: Number(phoneData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureUserExists(payload.identificacion);

    const existingPhone = await phoneRepository.findPhoneByNumber(payload.telefono);
    if (existingPhone) {
        throw createHttpError('Phone already exists', 409);
    }

    await phoneRepository.createPhone(payload);
    invalidatePhoneCache(payload.identificacion, payload.telefono);

    return getPhoneByPk(payload.identificacion, payload.telefono);
}

async function updatePhone(identificacion, telefono, phoneData) {
    const normalizedIdentificacion = Number(identificacion);
    const normalizedTelefono = String(telefono || '').trim();
    const payload = {
        identificacion: normalizedIdentificacion,
        telefono: normalizedTelefono,
        idEstado: Number(phoneData.idEstado)
    };

    await getPhoneByPk(normalizedIdentificacion, normalizedTelefono);
    await ensureStateExists(payload.idEstado);
    await phoneRepository.updatePhone(payload);
    invalidatePhoneCache(normalizedIdentificacion, normalizedTelefono);

    return getPhoneByPk(normalizedIdentificacion, normalizedTelefono);
}

async function deletePhone(identificacion, telefono) {
    const normalizedIdentificacion = Number(identificacion);
    const normalizedTelefono = String(telefono || '').trim();

    await getPhoneByPk(normalizedIdentificacion, normalizedTelefono);
    await phoneRepository.deletePhone(normalizedIdentificacion, normalizedTelefono);
    invalidatePhoneCache(normalizedIdentificacion, normalizedTelefono);
}

module.exports = {
    getPhones,
    getPhoneByPk,
    createPhone,
    updatePhone,
    deletePhone
};
