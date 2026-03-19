const catalogService = require('./catalogService');
const dogService = require('./dogService');
const fosterHomeService = require('./fosterHomeService');
const houseDogRepository = require('../repositories/houseDogRepository');
const MemoryCache = require('../utils/memoryCache');

const HOUSE_DOG_LIST_CACHE_KEY = 'house-dog:list';
const HOUSE_DOG_DETAIL_CACHE_PREFIX = 'house-dog:detail:';
const HOUSE_DOG_CACHE_TTL_MS = Number(process.env.HOUSE_DOG_CACHE_TTL_MS || 15000);
const houseDogQueryCache = new MemoryCache({
    defaultTtlMs: HOUSE_DOG_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeHouseDogKey(idCasaCuna, idPerrito) {
    return `${String(idCasaCuna).trim()}:${String(idPerrito).trim()}`;
}

function getHouseDogDetailCacheKey(idCasaCuna, idPerrito) {
    return `${HOUSE_DOG_DETAIL_CACHE_PREFIX}${normalizeHouseDogKey(idCasaCuna, idPerrito)}`;
}

function invalidateHouseDogCache(idCasaCuna, idPerrito) {
    houseDogQueryCache.delete(HOUSE_DOG_LIST_CACHE_KEY);

    if (
        idCasaCuna !== undefined &&
        idCasaCuna !== null &&
        idPerrito !== undefined &&
        idPerrito !== null
    ) {
        houseDogQueryCache.delete(getHouseDogDetailCacheKey(idCasaCuna, idPerrito));
        return;
    }

    houseDogQueryCache.clearByPrefix(HOUSE_DOG_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedReadCaches(idCasaCuna, idPerrito) {
    invalidateHouseDogCache(idCasaCuna, idPerrito);
    fosterHomeService.invalidateFosterHomeReadCaches?.(idCasaCuna);
    dogService.invalidateDogReadCaches?.(idPerrito);
}

function formatHouseDog(houseDog) {
    return {
        idCasaCuna: Number(houseDog.ID_CASA_CUNA),
        casaCuna: houseDog.CASA_CUNA || null,
        idPerrito: Number(houseDog.ID_PERRITO),
        nombrePerrito: houseDog.NOMBRE_PERRITO || houseDog.PERRITO || null,
        idEstado: Number(houseDog.ID_ESTADO),
        estado: houseDog.ESTADO_RELACION || houseDog.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

function ensureActiveHouseDogCanBeApplied({ fosterHome, dog, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(fosterHome.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a house-dog relation active for an inactive foster home',
            409
        );
    }

    if (Number(dog.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a house-dog relation active for an inactive dog',
            409
        );
    }
}

async function ensureDogAssignmentIsAvailable(
    idPerrito,
    { excludeIdCasaCuna = null, excludeIdPerrito = null } = {}
) {
    const existingAssignment = await houseDogRepository.findActiveHouseDogByDogId(idPerrito, {
        excludeIdCasaCuna,
        excludeIdPerrito
    });

    if (existingAssignment) {
        throw createHttpError(
            'The selected dog is already assigned to another active foster home',
            409
        );
    }
}

async function getHouseDogs() {
    return houseDogQueryCache.getOrSet(HOUSE_DOG_LIST_CACHE_KEY, async () => {
        const houseDogs = await houseDogRepository.findAllHouseDogsForAdmin();
        return houseDogs.map(formatHouseDog);
    });
}

async function getHouseDogByPk(idCasaCuna, idPerrito) {
    return houseDogQueryCache.getOrSet(
        getHouseDogDetailCacheKey(idCasaCuna, idPerrito),
        async () => {
            const houseDog = await houseDogRepository.findHouseDogByPk(
                idCasaCuna,
                idPerrito
            );

            if (!houseDog) {
                throw createHttpError('House-dog relation not found', 404);
            }

            return formatHouseDog(houseDog);
        }
    );
}

async function createHouseDog(houseDogData) {
    const requestedState =
        houseDogData.idEstado === undefined ||
        houseDogData.idEstado === null ||
        houseDogData.idEstado === ''
            ? 1
            : Number(houseDogData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError(
            'New house-dog relations must start in active state',
            400
        );
    }

    const payload = {
        idCasaCuna: Number(houseDogData.idCasaCuna),
        idPerrito: Number(houseDogData.idPerrito),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [fosterHome, dog] = await Promise.all([
        fosterHomeService.getFosterHomeById(payload.idCasaCuna),
        dogService.getDogById(payload.idPerrito)
    ]);
    ensureActiveHouseDogCanBeApplied({
        fosterHome,
        dog,
        nextState: payload.idEstado
    });

    const existingHouseDog = await houseDogRepository.findHouseDogByPk(
        payload.idCasaCuna,
        payload.idPerrito
    );

    if (existingHouseDog) {
        throw createHttpError(
            'House-dog relation already exists. Update it if you need to reactivate it',
            409
        );
    }

    await ensureDogAssignmentIsAvailable(payload.idPerrito);
    await houseDogRepository.createHouseDog(payload);
    invalidateRelatedReadCaches(payload.idCasaCuna, payload.idPerrito);

    return getHouseDogByPk(payload.idCasaCuna, payload.idPerrito);
}

async function updateHouseDog(idCasaCuna, idPerrito, houseDogData) {
    const normalizedIdCasaCuna = Number(idCasaCuna);
    const normalizedIdPerrito = Number(idPerrito);
    const existingHouseDog = await getHouseDogByPk(normalizedIdCasaCuna, normalizedIdPerrito);
    const payload = {
        idCasaCuna: normalizedIdCasaCuna,
        idPerrito: normalizedIdPerrito,
        idEstado: Number(houseDogData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    if (Number(payload.idEstado) === 1) {
        const [fosterHome, dog] = await Promise.all([
            fosterHomeService.getFosterHomeById(payload.idCasaCuna),
            dogService.getDogById(payload.idPerrito)
        ]);

        ensureActiveHouseDogCanBeApplied({
            fosterHome,
            dog,
            nextState: payload.idEstado
        });
        await ensureDogAssignmentIsAvailable(payload.idPerrito, {
            excludeIdCasaCuna: payload.idCasaCuna,
            excludeIdPerrito: payload.idPerrito
        });
    }

    await houseDogRepository.updateHouseDog(payload);
    invalidateRelatedReadCaches(
        existingHouseDog.idCasaCuna,
        existingHouseDog.idPerrito
    );

    return getHouseDogByPk(payload.idCasaCuna, payload.idPerrito);
}

async function deleteHouseDog(idCasaCuna, idPerrito) {
    const existingHouseDog = await getHouseDogByPk(idCasaCuna, idPerrito);

    if (Number(existingHouseDog.idEstado) !== 1) {
        throw createHttpError('House-dog relation is already inactive', 409);
    }

    await houseDogRepository.deleteHouseDog(idCasaCuna, idPerrito);
    invalidateRelatedReadCaches(existingHouseDog.idCasaCuna, existingHouseDog.idPerrito);
}

module.exports = {
    getHouseDogs,
    getHouseDogByPk,
    createHouseDog,
    updateHouseDog,
    deleteHouseDog
};
