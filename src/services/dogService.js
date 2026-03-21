const adoptionRepository = require('../repositories/adoptionRepository');
const adoptionRequestRepository = require('../repositories/adoptionRequestRepository');
const breedRepository = require('../repositories/breedRepository');
const dogEventRepository = require('../repositories/dogEventRepository');
const dogImageRepository = require('../repositories/dogImageRepository');
const dogRepository = require('../repositories/dogRepository');
const houseDogRepository = require('../repositories/houseDogRepository');
const sexRepository = require('../repositories/sexRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const DOG_PUBLIC_LIST_CACHE_KEY = 'dog:public:list';
const DOG_PUBLIC_DETAIL_CACHE_PREFIX = 'dog:public:detail:';
const DOG_ADMIN_LIST_CACHE_KEY = 'dog:admin:list';
const DOG_ADMIN_DETAIL_CACHE_PREFIX = 'dog:admin:detail:';
const DOG_CACHE_TTL_MS = Number(process.env.DOG_CACHE_TTL_MS || 15000);
const dogQueryCache = new MemoryCache({ defaultTtlMs: DOG_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getPublicDogDetailCacheKey(idPerrito) {
    return `${DOG_PUBLIC_DETAIL_CACHE_PREFIX}${String(idPerrito).trim()}`;
}

function getAdminDogDetailCacheKey(idPerrito) {
    return `${DOG_ADMIN_DETAIL_CACHE_PREFIX}${String(idPerrito).trim()}`;
}

function invalidateDogReadCaches(idPerrito) {
    dogQueryCache.delete(DOG_PUBLIC_LIST_CACHE_KEY);
    dogQueryCache.delete(DOG_ADMIN_LIST_CACHE_KEY);

    if (idPerrito !== undefined && idPerrito !== null) {
        dogQueryCache.delete(getPublicDogDetailCacheKey(idPerrito));
        dogQueryCache.delete(getAdminDogDetailCacheKey(idPerrito));
        return;
    }

    dogQueryCache.clearByPrefix(DOG_PUBLIC_DETAIL_CACHE_PREFIX);
    dogQueryCache.clearByPrefix(DOG_ADMIN_DETAIL_CACHE_PREFIX);
}

function toNullableNumber(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsedValue = Number(value);
    return Number.isFinite(parsedValue) ? parsedValue : null;
}

function formatDog(row) {
    return {
        idPerrito: Number(row.ID_PERRITO),
        nombre: row.NOMBRE_PERRITO || row.NOMBRE,
        fechaIngreso: row.FECHA_INGRESO || null,
        edad: toNullableNumber(row.EDAD),
        peso: toNullableNumber(row.PESO),
        estatura: toNullableNumber(row.ESTATURA),
        idRaza: toNullableNumber(row.ID_RAZA),
        raza: row.RAZA || null,
        idSexo: toNullableNumber(row.ID_SEXO),
        sexo: row.SEXO || null,
        idEstado: toNullableNumber(row.ID_ESTADO),
        estado: row.ESTADO || null,
        imageUrl: row.IMAGE_URL || null
    };
}

function formatDogImage(row) {
    return {
        idImagen: Number(row.ID_IMAGEN),
        idPerrito: Number(row.ID_PERRITO),
        imageUrl: row.IMAGE_URL,
        idEstado: toNullableNumber(row.ID_ESTADO)
    };
}

function normalizeRequiredText(value, fieldLabel) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    return normalizedValue;
}

function parseDateValue(value, fieldLabel) {
    if (value === undefined || value === null || value === '') {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    const parsedDate = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedDate;
}

function parsePositiveInteger(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedValue;
}

function parseNonNegativeInteger(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 0) {
        throw createHttpError(`${fieldLabel} must be zero or greater`, 400);
    }

    return parsedValue;
}

function parsePositiveDecimal(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
        throw createHttpError(`${fieldLabel} must be greater than zero`, 400);
    }

    return parsedValue;
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
        throw createHttpError('Breed not found', 404);
    }

    return {
        idRaza: Number(breed.ID_RAZA),
        idEstado: Number(breed.ID_ESTADO)
    };
}

async function ensureSexExists(idSexo) {
    const sex = await sexRepository.findSexById(idSexo);

    if (!sex) {
        throw createHttpError('Sex not found', 404);
    }

    return {
        idSexo: Number(sex.ID_SEXO),
        idEstado: Number(sex.ID_ESTADO)
    };
}

function ensureActiveDogCanUseCatalogs({ breed, sex, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(breed.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a dog active under an inactive breed',
            409
        );
    }

    if (Number(sex.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a dog active under an inactive sex',
            409
        );
    }
}

async function ensureDogRelationsAllowDeactivation(idPerrito) {
    const [dogImages, dogEvents, activeAdoption, activeHouseAssignment] = await Promise.all([
        dogImageRepository.findDogImagesByDogId(idPerrito),
        dogEventRepository.findAllDogEvents(),
        adoptionRepository.findActiveAdoptionByDogId(idPerrito),
        houseDogRepository.findActiveHouseDogByDogId(idPerrito)
    ]);

    const activeDogImagesCount = dogImages.filter(
        (dogImage) => Number(dogImage.ID_ESTADO) === 1
    ).length;
    const activeDogEventsCount = dogEvents.filter(
        (dogEvent) =>
            Number(dogEvent.ID_PERRITO) === Number(idPerrito) &&
            Number(dogEvent.ID_ESTADO) === 1
    ).length;

    if (
        activeDogImagesCount > 0 ||
        activeDogEventsCount > 0 ||
        activeAdoption ||
        activeHouseAssignment
    ) {
        throw createHttpError(
            'Cannot deactivate a dog that still has active related records',
            409
        );
    }
}

async function ensureDogCanBeDisabled(existingDog, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingDog.idEstado) !== 1) {
        return;
    }

    await ensureDogRelationsAllowDeactivation(existingDog.idPerrito);
}

async function ensureDogCanBeDeleted(existingDog) {
    if (Number(existingDog.idEstado) !== 1) {
        throw createHttpError('Dog is already inactive', 409);
    }

    await ensureDogRelationsAllowDeactivation(existingDog.idPerrito);
}

function normalizeCreatePayload(dogData) {
    return {
        nombre: normalizeRequiredText(dogData.nombre, 'Name'),
        fechaIngreso: parseDateValue(dogData.fechaIngreso, 'Entry date'),
        edad: parseNonNegativeInteger(dogData.edad, 'Age'),
        peso: parsePositiveDecimal(dogData.peso, 'Weight'),
        estatura: parsePositiveDecimal(dogData.estatura, 'Height'),
        idSexo: parsePositiveInteger(dogData.idSexo, 'Sex'),
        idRaza: parsePositiveInteger(dogData.idRaza, 'Breed'),
        idEstado: parsePositiveInteger(dogData.idEstado, 'State')
    };
}

function normalizeUpdatePayload(dogData) {
    return {
        nombre: normalizeRequiredText(dogData.nombre, 'Name'),
        edad: parseNonNegativeInteger(dogData.edad, 'Age'),
        peso: parsePositiveDecimal(dogData.peso, 'Weight'),
        estatura: parsePositiveDecimal(dogData.estatura, 'Height'),
        idSexo: parsePositiveInteger(dogData.idSexo, 'Sex'),
        idRaza: parsePositiveInteger(dogData.idRaza, 'Breed'),
        idEstado: parsePositiveInteger(dogData.idEstado, 'State')
    };
}

// States that block a dog from appearing in the public catalog.
// ACTIVO and RECHAZADO adoptions still allow the dog to be listed.
const ADOPTION_BLOCKS_LISTING = new Set(['inactivo', 'en proceso', 'pendiente', 'aprobado']);

function normalizeStateName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

async function getActiveAdoptedDogIds() {
    const adoptions = await adoptionRequestRepository.findAllAdoptions();

    return new Set(
        adoptions
            .filter((adoption) => ADOPTION_BLOCKS_LISTING.has(normalizeStateName(adoption.ESTADO)))
            .map((adoption) => Number(adoption.ID_PERRITO))
    );
}

function filterDogsAvailableForAdoption(dogs, adoptedDogIds) {
    return dogs.filter(
        (dog) => Number(dog.idEstado || 1) === 1 && !adoptedDogIds.has(Number(dog.idPerrito))
    );
}

async function getAvailableDogs() {
    return dogQueryCache.getOrSet(DOG_PUBLIC_LIST_CACHE_KEY, async () => {
        const [dogRows, adoptedDogIds] = await Promise.all([
            dogRepository.findAvailableDogs(),
            getActiveAdoptedDogIds()
        ]);

        return filterDogsAvailableForAdoption(dogRows.map(formatDog), adoptedDogIds);
    });
}

async function getDogs() {
    return dogQueryCache.getOrSet(DOG_ADMIN_LIST_CACHE_KEY, async () => {
        const [dogRows, dogRowsWithImages] = await Promise.all([
            dogRepository.findAllDogs(),
            dogRepository.findAvailableDogs()
        ]);

        const imageUrlByDogId = new Map(
            dogRowsWithImages.map((dog) => [Number(dog.ID_PERRITO), dog.IMAGE_URL || null])
        );

        return dogRows.map((dog) =>
            formatDog({
                ...dog,
                IMAGE_URL: imageUrlByDogId.get(Number(dog.ID_PERRITO)) || null
            })
        );
    });
}

async function getDogById(idPerrito) {
    return dogQueryCache.getOrSet(getPublicDogDetailCacheKey(idPerrito), async () => {
        const [dogRow, imageRows, adoptedDogIds] = await Promise.all([
            dogRepository.findDogById(idPerrito),
            dogRepository.findDogImages(idPerrito),
            getActiveAdoptedDogIds()
        ]);

        if (!dogRow) {
            throw createHttpError('Dog not found', 404);
        }

        const dog = formatDog(dogRow);

        if (Number(dog.idEstado || 1) !== 1 || adoptedDogIds.has(Number(dog.idPerrito))) {
            throw createHttpError('Dog not available for adoption', 404);
        }

        const activeImages = imageRows
            .map(formatDogImage)
            .filter((image) => Number(image.idEstado || 1) === 1);

        return {
            ...dog,
            images: activeImages,
            imageUrl: dog.imageUrl || activeImages[0]?.imageUrl || null
        };
    });
}

async function getDogByIdForAdmin(idPerrito) {
    return dogQueryCache.getOrSet(getAdminDogDetailCacheKey(idPerrito), async () => {
        const [dogRow, imageRows] = await Promise.all([
            dogRepository.findDogById(idPerrito),
            dogRepository.findDogImages(idPerrito)
        ]);

        if (!dogRow) {
            throw createHttpError('Dog not found', 404);
        }

        const dog = formatDog(dogRow);
        const activeImages = imageRows
            .map(formatDogImage)
            .filter((image) => Number(image.idEstado || 1) === 1);

        return {
            ...dog,
            images: activeImages,
            imageUrl: dog.imageUrl || activeImages[0]?.imageUrl || null
        };
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
    ensureActiveDogCanUseCatalogs({
        breed,
        sex,
        nextState: payload.idEstado
    });

    const result = await dogRepository.createDog(payload);
    invalidateDogReadCaches(result.idPerrito);

    return getDogByIdForAdmin(result.idPerrito);
}

async function updateDog(idPerrito, dogData) {
    const existingDog = await getDogByIdForAdmin(idPerrito);
    const payload = {
        idPerrito: Number(idPerrito),
        ...normalizeUpdatePayload(dogData)
    };

    await ensureStateExists(payload.idEstado);
    const [breed, sex] = await Promise.all([
        ensureBreedExists(payload.idRaza),
        ensureSexExists(payload.idSexo)
    ]);
    ensureActiveDogCanUseCatalogs({
        breed,
        sex,
        nextState: payload.idEstado
    });
    await ensureDogCanBeDisabled(existingDog, payload.idEstado);

    await dogRepository.updateDog(payload);
    invalidateDogReadCaches(payload.idPerrito);

    return getDogByIdForAdmin(payload.idPerrito);
}

async function deleteDog(idPerrito) {
    const existingDog = await getDogByIdForAdmin(idPerrito);

    await ensureDogCanBeDeleted(existingDog);
    await dogRepository.deleteDog(idPerrito);
    invalidateDogReadCaches(idPerrito);
}

module.exports = {
    getAvailableDogs,
    getDogs,
    getDogById,
    getDogByIdForAdmin,
    createDog,
    updateDog,
    deleteDog,
    invalidateDogReadCaches
};
