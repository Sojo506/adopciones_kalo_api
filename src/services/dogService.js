const breedRepository = require('../repositories/breedRepository');
const sexRepository = require('../repositories/sexRepository');
const dogRepository = require('../repositories/dogRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const DOG_LIST_CACHE_KEY = 'dog:list';
const DOG_DETAIL_CACHE_PREFIX = 'dog:detail:';
const DOG_CACHE_TTL_MS = Number(process.env.DOG_CACHE_TTL_MS || 15000);
const dogQueryCache = new MemoryCache({ defaultTtlMs: DOG_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getDogDetailCacheKey(idPerrito) {
    return `${DOG_DETAIL_CACHE_PREFIX}${String(idPerrito).trim()}`;
}

function invalidateDogCache(idPerrito) {
    dogQueryCache.delete(DOG_LIST_CACHE_KEY);

    if (idPerrito !== undefined && idPerrito !== null) {
        dogQueryCache.delete(getDogDetailCacheKey(idPerrito));
        return;
    }

    dogQueryCache.clearByPrefix(DOG_DETAIL_CACHE_PREFIX);
}

function parseRequiredDate(value, fieldLabel) {
    if (value === undefined || value === null || value === '') {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedDate;
}

function ensureNonEmptyText(value, fieldLabel) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    return normalizedValue;
}

function parseInteger(value, fieldLabel, { min = 0 } = {}) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < min) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedValue;
}

function parsePositiveNumber(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw createHttpError(`${fieldLabel} must be greater than zero`, 400);
    }

    return parsedValue;
}

function formatDog(dog) {
    return {
        idPerrito: Number(dog.ID_PERRITO),
        nombre: dog.NOMBRE_PERRITO || dog.NOMBRE || null,
        fechaIngreso: dog.FECHA_INGRESO || null,
        edad: dog.EDAD === null || dog.EDAD === undefined ? null : Number(dog.EDAD),
        peso: dog.PESO === null || dog.PESO === undefined ? null : Number(dog.PESO),
        estatura: dog.ESTATURA === null || dog.ESTATURA === undefined ? null : Number(dog.ESTATURA),
        idSexo: Number(dog.ID_SEXO),
        sexo: dog.SEXO || null,
        idRaza: Number(dog.ID_RAZA),
        raza: dog.RAZA || null,
        idEstado: Number(dog.ID_ESTADO),
        estado: dog.ESTADO || null,
        imageUrl: dog.IMAGE_URL || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureBreedExists(idRaza) {
    const breed = await breedRepository.findBreedById(idRaza);

    if (!breed) {
        throw createHttpError('Breed not found', 400);
    }

    return breed;
}

async function ensureSexExists(idSexo) {
    const sex = await sexRepository.findSexById(idSexo);

    if (!sex) {
        throw createHttpError('Sex not found', 400);
    }

    return sex;
}

function ensureActiveDogCanUseAssignments({ breed, sex, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(breed.ID_ESTADO) !== 1) {
        throw createHttpError('Cannot keep a dog active under an inactive breed', 409);
    }

    if (Number(sex.ID_ESTADO) !== 1) {
        throw createHttpError('Cannot keep a dog active under an inactive sex', 409);
    }
}

async function ensureDogCanBeDisabled(existingDog, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingDog.idEstado) !== 1) {
        return;
    }

    const dependencySummary = await dogRepository.getActiveDependencySummaryByDog(existingDog.idPerrito);

    if (dependencySummary.activeImages > 0) {
        throw createHttpError(
            'Cannot deactivate a dog that still has active images',
            409
        );
    }

    if (dependencySummary.activeEvents > 0) {
        throw createHttpError(
            'Cannot deactivate a dog that still has active events',
            409
        );
    }

    if (dependencySummary.activeRequests > 0) {
        throw createHttpError(
            'Cannot deactivate a dog that still has active requests',
            409
        );
    }

    if (dependencySummary.activeHouseAssignments > 0) {
        throw createHttpError(
            'Cannot deactivate a dog that still has active house assignments',
            409
        );
    }
}

async function ensureDogCanBeDeleted(existingDog) {
    if (Number(existingDog.idEstado) !== 1) {
        throw createHttpError('Dog is already inactive', 409);
    }

    await ensureDogCanBeDisabled(existingDog, 2);
}

function normalizeCreatePayload(dogData) {
    return {
        nombre: ensureNonEmptyText(dogData.nombre, 'Dog name'),
        fechaIngreso: parseRequiredDate(dogData.fechaIngreso, 'Admission date'),
        edad: parseInteger(dogData.edad, 'Age'),
        peso: parsePositiveNumber(dogData.peso, 'Weight'),
        estatura: parsePositiveNumber(dogData.estatura, 'Height'),
        idSexo: parseInteger(dogData.idSexo, 'Sex'),
        idRaza: parseInteger(dogData.idRaza, 'Breed'),
        idEstado: parseInteger(dogData.idEstado, 'State', { min: 1 })
    };
}

function normalizeUpdatePayload(dogData) {
    return {
        nombre: ensureNonEmptyText(dogData.nombre, 'Dog name'),
        edad: parseInteger(dogData.edad, 'Age'),
        peso: parsePositiveNumber(dogData.peso, 'Weight'),
        estatura: parsePositiveNumber(dogData.estatura, 'Height'),
        idSexo: parseInteger(dogData.idSexo, 'Sex'),
        idRaza: parseInteger(dogData.idRaza, 'Breed'),
        idEstado: parseInteger(dogData.idEstado, 'State', { min: 1 })
    };
}

async function getDogs() {
    return dogQueryCache.getOrSet(DOG_LIST_CACHE_KEY, async () => {
        const dogs = await dogRepository.findAllDogsForAdmin();
        return dogs.map((dog) => formatDog(dog));
    });
}

async function getDogById(idPerrito) {
    return dogQueryCache.getOrSet(getDogDetailCacheKey(idPerrito), async () => {
        const dog = await dogRepository.findDogById(idPerrito);

        if (!dog) {
            throw createHttpError('Dog not found', 404);
        }

        return formatDog(dog);
    });
}

async function createDog(dogData) {
    const requestedState =
        dogData.idEstado === undefined || dogData.idEstado === null || dogData.idEstado === ''
            ? 1
            : Number(dogData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New dogs must start in active state', 400);
    }

    const payload = normalizeCreatePayload({
        ...dogData,
        idEstado: requestedState
    });

    await ensureStateExists(payload.idEstado);
    const [breed, sex] = await Promise.all([
        ensureBreedExists(payload.idRaza),
        ensureSexExists(payload.idSexo)
    ]);
    ensureActiveDogCanUseAssignments({
        breed,
        sex,
        nextState: payload.idEstado
    });

    const result = await dogRepository.createDog(payload);
    invalidateDogCache(result.idPerrito);

    return getDogById(result.idPerrito);
}

async function updateDog(idPerrito, dogData) {
    const normalizedIdPerrito = Number(idPerrito);
    const existingDog = await getDogById(normalizedIdPerrito);
    const payload = normalizeUpdatePayload(dogData);

    await ensureStateExists(payload.idEstado);
    const [breed, sex] = await Promise.all([
        ensureBreedExists(payload.idRaza),
        ensureSexExists(payload.idSexo)
    ]);
    ensureActiveDogCanUseAssignments({
        breed,
        sex,
        nextState: payload.idEstado
    });
    await ensureDogCanBeDisabled(existingDog, payload.idEstado);

    await dogRepository.updateDog({
        idPerrito: normalizedIdPerrito,
        ...payload
    });
    invalidateDogCache(normalizedIdPerrito);

    return getDogById(normalizedIdPerrito);
}

async function deleteDog(idPerrito) {
    const normalizedIdPerrito = Number(idPerrito);
    const existingDog = await getDogById(normalizedIdPerrito);

    await ensureDogCanBeDeleted(existingDog);
    await dogRepository.deleteDog(normalizedIdPerrito);
    invalidateDogCache(normalizedIdPerrito);
}

module.exports = {
    getDogs,
    getDogById,
    createDog,
    updateDog,
    deleteDog,
    invalidateDogReadCaches: invalidateDogCache
};
