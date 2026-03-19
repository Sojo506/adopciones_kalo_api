const addressService = require('./addressService');
const catalogService = require('./catalogService');
const requestService = require('./requestService');
const userService = require('./userService');
const fosterHomeRepository = require('../repositories/fosterHomeRepository');
const MemoryCache = require('../utils/memoryCache');

const FOSTER_HOME_LIST_CACHE_KEY = 'foster-home:list';
const FOSTER_HOME_DETAIL_CACHE_PREFIX = 'foster-home:detail:';
const FOSTER_HOME_CACHE_TTL_MS = Number(process.env.FOSTER_HOME_CACHE_TTL_MS || 15000);
const CASA_CUNA_REQUEST_TYPE_NAME = 'Casa Cuna';
const CASA_CUNA_REQUEST_TYPE_FALLBACK_ID = 2;
const fosterHomeQueryCache = new MemoryCache({
    defaultTtlMs: FOSTER_HOME_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCatalogName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeOptionalForeignKey(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return Number(value);
}

function getFosterHomeDetailCacheKey(idCasaCuna) {
    return `${FOSTER_HOME_DETAIL_CACHE_PREFIX}${String(idCasaCuna).trim()}`;
}

function invalidateFosterHomeCache(idCasaCuna) {
    fosterHomeQueryCache.delete(FOSTER_HOME_LIST_CACHE_KEY);

    if (idCasaCuna !== undefined && idCasaCuna !== null) {
        fosterHomeQueryCache.delete(getFosterHomeDetailCacheKey(idCasaCuna));
        return;
    }

    fosterHomeQueryCache.clearByPrefix(FOSTER_HOME_DETAIL_CACHE_PREFIX);
}

function formatFosterHome(fosterHome) {
    const ubicacion = [
        fosterHome.DISTRITO,
        fosterHome.CANTON,
        fosterHome.PROVINCIA,
        fosterHome.PAIS
    ]
        .filter(Boolean)
        .join(', ');

    return {
        idCasaCuna: Number(fosterHome.ID_CASA_CUNA),
        nombre: fosterHome.NOMBRE || null,
        idDireccion: Number(fosterHome.ID_DIRECCION),
        idDistrito:
            fosterHome.ID_DISTRITO === null || fosterHome.ID_DISTRITO === undefined
                ? null
                : Number(fosterHome.ID_DISTRITO),
        distrito: fosterHome.DISTRITO || null,
        idCanton:
            fosterHome.ID_CANTON === null || fosterHome.ID_CANTON === undefined
                ? null
                : Number(fosterHome.ID_CANTON),
        canton: fosterHome.CANTON || null,
        idProvincia:
            fosterHome.ID_PROVINCIA === null || fosterHome.ID_PROVINCIA === undefined
                ? null
                : Number(fosterHome.ID_PROVINCIA),
        provincia: fosterHome.PROVINCIA || null,
        idPais:
            fosterHome.ID_PAIS === null || fosterHome.ID_PAIS === undefined
                ? null
                : Number(fosterHome.ID_PAIS),
        pais: fosterHome.PAIS || null,
        calle: fosterHome.CALLE || null,
        numero: fosterHome.NUMERO || null,
        ubicacion: ubicacion || null,
        identificacion: String(fosterHome.IDENTIFICACION),
        encargado: fosterHome.ENCARGADO || null,
        idSolicitud:
            fosterHome.ID_SOLICITUD === null || fosterHome.ID_SOLICITUD === undefined
                ? null
                : Number(fosterHome.ID_SOLICITUD),
        idTipoSolicitud:
            fosterHome.ID_TIPO_SOLICITUD === null || fosterHome.ID_TIPO_SOLICITUD === undefined
                ? null
                : Number(fosterHome.ID_TIPO_SOLICITUD),
        tipoSolicitud: fosterHome.TIPO_SOLICITUD || null,
        totalPerritos: Number(fosterHome.TOTAL_PERRITOS || 0),
        idEstado: Number(fosterHome.ID_ESTADO),
        estado: fosterHome.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureAddressExists(idDireccion) {
    return addressService.getAddressById(idDireccion);
}

async function ensureManagerExists(identificacion) {
    return userService.getUserByIdentification(identificacion);
}

async function ensureRequestExistsIfPresent(idSolicitud) {
    if (idSolicitud === null) {
        return null;
    }

    return requestService.getRequestById(idSolicitud);
}

async function getCasaCunaRequestTypeId() {
    const requestTypes = await catalogService.getRequestTypes();
    const matchingRequestType = requestTypes.find(
        (requestType) =>
            normalizeCatalogName(requestType.nombre) ===
            normalizeCatalogName(CASA_CUNA_REQUEST_TYPE_NAME)
    );

    if (matchingRequestType) {
        return Number(matchingRequestType.idTipoSolicitud);
    }

    const fallbackRequestType = requestTypes.find(
        (requestType) =>
            Number(requestType.idTipoSolicitud) === CASA_CUNA_REQUEST_TYPE_FALLBACK_ID
    );

    if (fallbackRequestType) {
        return Number(fallbackRequestType.idTipoSolicitud);
    }

    throw createHttpError(`Request type "${CASA_CUNA_REQUEST_TYPE_NAME}" is not configured`, 500);
}

async function ensureRequestCanBeAssignedToFosterHome(request) {
    if (!request) {
        return;
    }

    const casaCunaRequestTypeId = await getCasaCunaRequestTypeId();
    const requestTypeMatches =
        Number(request.idTipoSolicitud) === Number(casaCunaRequestTypeId) ||
        normalizeCatalogName(request.tipoSolicitud) ===
            normalizeCatalogName(CASA_CUNA_REQUEST_TYPE_NAME);

    if (!requestTypeMatches) {
        throw createHttpError(
            'The selected request is not a Casa Cuna request',
            409
        );
    }
}

async function ensureRequestIsAvailable(idSolicitud, { excludeId = null } = {}) {
    if (idSolicitud === null) {
        return;
    }

    const existingFosterHome = await fosterHomeRepository.findFosterHomeByRequestId(idSolicitud, {
        excludeId
    });

    if (existingFosterHome) {
        throw createHttpError(
            'The selected request is already assigned to another foster home',
            409
        );
    }
}

function ensureFosterHomeCanRemainActive({ address, manager, request, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(address.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a foster home active under an inactive address',
            409
        );
    }

    if (Number(manager.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a foster home active under an inactive manager',
            409
        );
    }

    if (request && Number(request.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a foster home active under an inactive request',
            409
        );
    }
}

async function getActiveDogAssignmentsCount(idCasaCuna) {
    return fosterHomeRepository.countActiveDogAssignmentsByFosterHome(idCasaCuna);
}

async function ensureFosterHomeCanBeDisabled(existingFosterHome, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingFosterHome.idEstado) !== 1) {
        return;
    }

    const activeDogAssignmentsCount = await getActiveDogAssignmentsCount(
        existingFosterHome.idCasaCuna
    );

    if (activeDogAssignmentsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a foster home that still has active dog assignments',
            409
        );
    }
}

async function ensureFosterHomeCanBeDeleted(existingFosterHome) {
    if (Number(existingFosterHome.idEstado) !== 1) {
        throw createHttpError('Foster home is already inactive', 409);
    }

    const activeDogAssignmentsCount = await getActiveDogAssignmentsCount(
        existingFosterHome.idCasaCuna
    );

    if (activeDogAssignmentsCount > 0) {
        throw createHttpError(
            'Cannot delete a foster home that still has active dog assignments',
            409
        );
    }
}

async function getFosterHomes() {
    return fosterHomeQueryCache.getOrSet(FOSTER_HOME_LIST_CACHE_KEY, async () => {
        const fosterHomes = await fosterHomeRepository.findAllFosterHomes();
        return fosterHomes.map(formatFosterHome);
    });
}

async function getFosterHomeById(idCasaCuna) {
    return fosterHomeQueryCache.getOrSet(getFosterHomeDetailCacheKey(idCasaCuna), async () => {
        const fosterHome = await fosterHomeRepository.findFosterHomeById(idCasaCuna);

        if (!fosterHome) {
            throw createHttpError('Foster home not found', 404);
        }

        return formatFosterHome(fosterHome);
    });
}

async function createFosterHome(fosterHomeData) {
    const payload = {
        nombre: String(fosterHomeData.nombre || '').trim(),
        idDireccion: Number(fosterHomeData.idDireccion),
        identificacion: String(fosterHomeData.identificacion || '').trim(),
        idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
        idEstado: Number(fosterHomeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [address, manager, request] = await Promise.all([
        ensureAddressExists(payload.idDireccion),
        ensureManagerExists(payload.identificacion),
        ensureRequestExistsIfPresent(payload.idSolicitud)
    ]);

    await ensureRequestCanBeAssignedToFosterHome(request);
    await ensureRequestIsAvailable(payload.idSolicitud);
    ensureFosterHomeCanRemainActive({
        address,
        manager,
        request,
        nextState: payload.idEstado
    });

    const result = await fosterHomeRepository.createFosterHome(payload);
    invalidateFosterHomeCache(result.idCasaCuna);

    return getFosterHomeById(result.idCasaCuna);
}

async function updateFosterHome(idCasaCuna, fosterHomeData) {
    const existingFosterHome = await getFosterHomeById(idCasaCuna);
    const payload = {
        idCasaCuna: Number(idCasaCuna),
        nombre: String(fosterHomeData.nombre || '').trim(),
        idDireccion: Number(fosterHomeData.idDireccion),
        identificacion: String(fosterHomeData.identificacion || '').trim(),
        idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
        idEstado: Number(fosterHomeData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [address, manager, request] = await Promise.all([
        ensureAddressExists(payload.idDireccion),
        ensureManagerExists(payload.identificacion),
        ensureRequestExistsIfPresent(payload.idSolicitud)
    ]);

    await ensureRequestCanBeAssignedToFosterHome(request);
    await ensureRequestIsAvailable(payload.idSolicitud, {
        excludeId: payload.idCasaCuna
    });
    ensureFosterHomeCanRemainActive({
        address,
        manager,
        request,
        nextState: payload.idEstado
    });
    await ensureFosterHomeCanBeDisabled(existingFosterHome, payload.idEstado);

    await fosterHomeRepository.updateFosterHome(payload);
    invalidateFosterHomeCache(payload.idCasaCuna);

    return getFosterHomeById(payload.idCasaCuna);
}

async function deleteFosterHome(idCasaCuna) {
    const existingFosterHome = await getFosterHomeById(idCasaCuna);

    await ensureFosterHomeCanBeDeleted(existingFosterHome);
    await fosterHomeRepository.deleteFosterHome(idCasaCuna);
    invalidateFosterHomeCache(idCasaCuna);
}

module.exports = {
    getFosterHomes,
    getFosterHomeById,
    createFosterHome,
    updateFosterHome,
    deleteFosterHome
};
