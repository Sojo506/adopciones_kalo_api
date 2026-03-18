const catalogRepository = require('../repositories/catalogRepository');
const MemoryCache = require('../utils/memoryCache');

const ONE_HOUR_MS = 60 * 60 * 1000;
const catalogCache = new MemoryCache({ defaultTtlMs: ONE_HOUR_MS });

async function getUserTypes() {
    return catalogCache.getOrSet('catalog:user-types', async () => {
        const userTypes = await catalogRepository.findUserTypes();
        return userTypes.map((userType) => ({
            idTipoUsuario: userType.ID_TIPO_USUARIO,
            nombre: userType.NOMBRE,
            idEstado: userType.ID_ESTADO
        }));
    });
}

async function getStates() {
    return catalogCache.getOrSet('catalog:states', async () => {
        const states = await catalogRepository.findStates();
        return states.map((state) => ({
            idEstado: state.ID_ESTADO,
            nombre: state.NOMBRE_ESTADO
        }));
    });
}

function invalidateUserTypesCache() {
    catalogCache.delete('catalog:user-types');
}

module.exports = { getUserTypes, getStates, invalidateUserTypesCache };
