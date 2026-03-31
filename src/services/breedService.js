const breedRepository = require('../repositories/breedRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const BREED_LIST_CACHE_KEY = 'breed:list';
const BREED_DETAIL_CACHE_PREFIX = 'breed:detail:';
const BREED_CACHE_TTL_MS = Number(process.env.BREED_CACHE_TTL_MS || 15000);
const breedQueryCache = new MemoryCache({ defaultTtlMs: BREED_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeBreedName(value) {
    return String(value || '').trim().toLowerCase();
}

function getBreedDetailCacheKey(idRaza) {
    return `${BREED_DETAIL_CACHE_PREFIX}${String(idRaza).trim()}`;
}

function invalidateBreedCache(idRaza) {
    breedQueryCache.delete(BREED_LIST_CACHE_KEY);

    if (idRaza !== undefined && idRaza !== null) {
        breedQueryCache.delete(getBreedDetailCacheKey(idRaza));
        return;
    }

    breedQueryCache.clearByPrefix(BREED_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idRaza = null) {
    invalidateBreedCache(idRaza);
    catalogService.invalidateBreedsCache();
}

function formatBreed(breed) {
    return {
        idRaza: breed.ID_RAZA,
        nombre: breed.NOMBRE,
        idEstado: breed.ID_ESTADO,
        estado: breed.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureBreedNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeBreedName(nombre);
    const breeds = await getBreeds();
    const duplicatedBreed = breeds.find(
        (breed) =>
            normalizeBreedName(breed.nombre) === normalizedName &&
            Number(breed.idRaza) !== Number(excludeId)
    );

    if (duplicatedBreed) {
        throw createHttpError('Breed name already exists', 409);
    }
}

async function ensureBreedCanBeDisabled(existingBreed, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingBreed.idEstado)) {
        return;
    }

    const activeDogsCount = await breedRepository.countActiveDogsByBreed(existingBreed.idRaza);

    if (activeDogsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a breed that still has active dogs',
            409
        );
    }
}

async function ensureBreedCanBeDeleted(existingBreed) {
    if (isInactiveState(existingBreed.idEstado)) {
        throw createHttpError('Breed is already inactive', 409);
    }

    const activeDogsCount = await breedRepository.countActiveDogsByBreed(existingBreed.idRaza);

    if (activeDogsCount > 0) {
        throw createHttpError(
            'Cannot delete a breed that still has active dogs',
            409
        );
    }
}

async function getBreeds() {
    return breedQueryCache.getOrSet(BREED_LIST_CACHE_KEY, async () => {
        const breeds = await breedRepository.findAllBreedsForAdmin();
        return breeds.map(formatBreed);
    });
}

async function getBreedById(idRaza) {
    return breedQueryCache.getOrSet(getBreedDetailCacheKey(idRaza), async () => {
        const breed = await breedRepository.findBreedById(idRaza);

        if (!breed) {
            throw createHttpError('Breed not found', 404);
        }

        return formatBreed(breed);
    });
}

async function createBreed(breedData) {
    const payload = {
        nombre: String(breedData.nombre || '').trim(),
        idEstado: Number(breedData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureBreedNameIsAvailable(payload.nombre);

    const result = await breedRepository.createBreed(payload);
    invalidateRelatedCaches(result.idRaza);

    return getBreedById(result.idRaza);
}

async function updateBreed(idRaza, breedData) {
    const existingBreed = await getBreedById(idRaza);
    const payload = {
        idRaza: Number(idRaza),
        nombre: String(breedData.nombre || '').trim(),
        idEstado: Number(breedData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureBreedNameIsAvailable(payload.nombre, { excludeId: payload.idRaza });
    await ensureBreedCanBeDisabled(existingBreed, payload.idEstado);

    await breedRepository.updateBreed(payload);
    invalidateRelatedCaches(payload.idRaza);

    return getBreedById(payload.idRaza);
}

async function deleteBreed(idRaza) {
    const existingBreed = await getBreedById(idRaza);

    await ensureBreedCanBeDeleted(existingBreed);
    await breedRepository.deleteBreed(idRaza);
    invalidateRelatedCaches(idRaza);
}

module.exports = {
    getBreeds,
    getBreedById,
    createBreed,
    updateBreed,
    deleteBreed
};
