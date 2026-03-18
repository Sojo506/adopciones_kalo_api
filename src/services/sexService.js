const catalogService = require('./catalogService');
const sexRepository = require('../repositories/sexRepository');
const MemoryCache = require('../utils/memoryCache');

const SEX_LIST_CACHE_KEY = 'sex:list';
const SEX_DETAIL_CACHE_PREFIX = 'sex:detail:';
const SEX_CACHE_TTL_MS = Number(process.env.SEX_CACHE_TTL_MS || 15000);
const sexQueryCache = new MemoryCache({ defaultTtlMs: SEX_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeSexName(value) {
    return String(value || '').trim().toLowerCase();
}

function getSexDetailCacheKey(idSexo) {
    return `${SEX_DETAIL_CACHE_PREFIX}${String(idSexo).trim()}`;
}

function invalidateSexCache(idSexo) {
    sexQueryCache.delete(SEX_LIST_CACHE_KEY);

    if (idSexo !== undefined && idSexo !== null) {
        sexQueryCache.delete(getSexDetailCacheKey(idSexo));
        return;
    }

    sexQueryCache.clearByPrefix(SEX_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idSexo = null) {
    invalidateSexCache(idSexo);
    catalogService.invalidateSexesCache();
}

function formatSex(sex) {
    return {
        idSexo: sex.ID_SEXO,
        nombre: sex.NOMBRE,
        idEstado: sex.ID_ESTADO,
        estado: sex.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureSexNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeSexName(nombre);
    const sexes = await getSexes();
    const duplicatedSex = sexes.find(
        (sex) =>
            normalizeSexName(sex.nombre) === normalizedName &&
            Number(sex.idSexo) !== Number(excludeId)
    );

    if (duplicatedSex) {
        throw createHttpError('Sex name already exists', 409);
    }
}

async function ensureSexCanBeDisabled(existingSex, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingSex.idEstado) !== 1) {
        return;
    }

    const activeDogsCount = await sexRepository.countActiveDogsBySex(existingSex.idSexo);

    if (activeDogsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a sex that still has active dogs',
            409
        );
    }
}

async function ensureSexCanBeDeleted(existingSex) {
    if (Number(existingSex.idEstado) !== 1) {
        throw createHttpError('Sex is already inactive', 409);
    }

    const activeDogsCount = await sexRepository.countActiveDogsBySex(existingSex.idSexo);

    if (activeDogsCount > 0) {
        throw createHttpError(
            'Cannot delete a sex that still has active dogs',
            409
        );
    }
}

async function getSexes() {
    return sexQueryCache.getOrSet(SEX_LIST_CACHE_KEY, async () => {
        const sexes = await sexRepository.findAllSexesForAdmin();
        return sexes.map(formatSex);
    });
}

async function getSexById(idSexo) {
    return sexQueryCache.getOrSet(getSexDetailCacheKey(idSexo), async () => {
        const sex = await sexRepository.findSexById(idSexo);

        if (!sex) {
            throw createHttpError('Sex not found', 404);
        }

        return formatSex(sex);
    });
}

async function createSex(sexData) {
    const payload = {
        nombre: String(sexData.nombre || '').trim(),
        idEstado: Number(sexData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureSexNameIsAvailable(payload.nombre);

    const result = await sexRepository.createSex(payload);
    invalidateRelatedCaches(result.idSexo);

    return getSexById(result.idSexo);
}

async function updateSex(idSexo, sexData) {
    const existingSex = await getSexById(idSexo);
    const payload = {
        idSexo: Number(idSexo),
        nombre: String(sexData.nombre || '').trim(),
        idEstado: Number(sexData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureSexNameIsAvailable(payload.nombre, { excludeId: payload.idSexo });
    await ensureSexCanBeDisabled(existingSex, payload.idEstado);

    await sexRepository.updateSex(payload);
    invalidateRelatedCaches(payload.idSexo);

    return getSexById(payload.idSexo);
}

async function deleteSex(idSexo) {
    const existingSex = await getSexById(idSexo);

    await ensureSexCanBeDeleted(existingSex);
    await sexRepository.deleteSex(idSexo);
    invalidateRelatedCaches(idSexo);
}

module.exports = {
    getSexes,
    getSexById,
    createSex,
    updateSex,
    deleteSex
};
