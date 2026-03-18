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

async function getOtpTypes() {
    return catalogCache.getOrSet('catalog:otp-types', async () => {
        const otpTypes = await catalogRepository.findOtpTypes();
        return otpTypes.map((otpType) => ({
            idTipoOtp: otpType.ID_TIPO_OTP,
            nombre: otpType.NOMBRE,
            idEstado: otpType.ID_ESTADO
        }));
    });
}

async function getOtpTypeById(idTipoOtp) {
    const otpType = await catalogRepository.findOtpTypeById(idTipoOtp);

    if (!otpType) {
        return null;
    }

    return {
        idTipoOtp: otpType.ID_TIPO_OTP,
        nombre: otpType.NOMBRE,
        idEstado: otpType.ID_ESTADO,
        estado: otpType.ESTADO
    };
}

async function getCategories() {
    return catalogCache.getOrSet('catalog:categories', async () => {
        const categories = await catalogRepository.findCategories();
        return categories.map((category) => ({
            idCategoria: category.ID_CATEGORIA,
            nombre: category.NOMBRE,
            idEstado: category.ID_ESTADO
        }));
    });
}

function invalidateUserTypesCache() {
    catalogCache.delete('catalog:user-types');
}

function invalidateStatesCache() {
    catalogCache.delete('catalog:states');
}

function invalidateOtpTypesCache() {
    catalogCache.delete('catalog:otp-types');
}

function invalidateCategoriesCache() {
    catalogCache.delete('catalog:categories');
}

module.exports = {
    getUserTypes,
    getStates,
    getOtpTypes,
    getOtpTypeById,
    getCategories,
    invalidateUserTypesCache,
    invalidateStatesCache,
    invalidateOtpTypesCache,
    invalidateCategoriesCache
};
