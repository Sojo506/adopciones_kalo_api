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

async function getBrands() {
    return catalogCache.getOrSet('catalog:brands', async () => {
        const brands = await catalogRepository.findBrands();
        return brands.map((brand) => ({
            idMarca: brand.ID_MARCA,
            nombre: brand.NOMBRE,
            idEstado: brand.ID_ESTADO
        }));
    });
}

async function getCurrencies() {
    return catalogCache.getOrSet('catalog:currencies', async () => {
        const currencies = await catalogRepository.findCurrencies();
        return currencies.map((currency) => ({
            idMoneda: currency.ID_MONEDA,
            nombre: currency.NOMBRE,
            simbolo: currency.SIMBOLO,
            idEstado: currency.ID_ESTADO
        }));
    });
}

async function getBreeds() {
    return catalogCache.getOrSet('catalog:breeds', async () => {
        const breeds = await catalogRepository.findBreeds();
        return breeds.map((breed) => ({
            idRaza: breed.ID_RAZA,
            nombre: breed.NOMBRE,
            idEstado: breed.ID_ESTADO
        }));
    });
}

async function getSexes() {
    return catalogCache.getOrSet('catalog:sexes', async () => {
        const sexes = await catalogRepository.findSexes();
        return sexes.map((sex) => ({
            idSexo: sex.ID_SEXO,
            nombre: sex.NOMBRE,
            idEstado: sex.ID_ESTADO
        }));
    });
}

async function getRequestTypes() {
    return catalogCache.getOrSet('catalog:request-types', async () => {
        const requestTypes = await catalogRepository.findRequestTypes();
        return requestTypes.map((requestType) => ({
            idTipoSolicitud: requestType.ID_TIPO_SOLICITUD,
            nombre: requestType.NOMBRE,
            idEstado: requestType.ID_ESTADO
        }));
    });
}

async function getResponseTypes() {
    return catalogCache.getOrSet('catalog:response-types', async () => {
        const responseTypes = await catalogRepository.findResponseTypes();
        return responseTypes.map((responseType) => ({
            idTipoRespuesta: responseType.ID_TIPO_RESPUESTA,
            nombre: responseType.NOMBRE,
            idEstado: responseType.ID_ESTADO
        }));
    });
}

async function getTrackingTypes() {
    return catalogCache.getOrSet('catalog:tracking-types', async () => {
        const trackingTypes = await catalogRepository.findTrackingTypes();
        return trackingTypes.map((trackingType) => ({
            idTipoSeguimiento: trackingType.ID_TIPO_SEGUIMIENTO,
            nombre: trackingType.NOMBRE,
            idEstado: trackingType.ID_ESTADO
        }));
    });
}

async function getEventTypes() {
    return catalogCache.getOrSet('catalog:event-types', async () => {
        const eventTypes = await catalogRepository.findEventTypes();
        return eventTypes.map((eventType) => ({
            idTipoEvento: eventType.ID_TIPO_EVENTO,
            nombre: eventType.NOMBRE,
            idEstado: eventType.ID_ESTADO
        }));
    });
}

async function getQuestions() {
    return catalogCache.getOrSet('catalog:questions', async () => {
        const questions = await catalogRepository.findQuestions();
        return questions.map((question) => ({
            idPregunta: question.ID_PREGUNTA,
            pregunta: question.PREGUNTA,
            idTipoRespuesta: question.ID_TIPO_RESPUESTA,
            tipoRespuesta: question.TIPO_RESPUESTA,
            idEstado: question.ID_ESTADO
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

function invalidateBrandsCache() {
    catalogCache.delete('catalog:brands');
}

function invalidateCurrenciesCache() {
    catalogCache.delete('catalog:currencies');
}

function invalidateBreedsCache() {
    catalogCache.delete('catalog:breeds');
}

function invalidateSexesCache() {
    catalogCache.delete('catalog:sexes');
}

function invalidateRequestTypesCache() {
    catalogCache.delete('catalog:request-types');
}

function invalidateResponseTypesCache() {
    catalogCache.delete('catalog:response-types');
}

function invalidateTrackingTypesCache() {
    catalogCache.delete('catalog:tracking-types');
}

function invalidateEventTypesCache() {
    catalogCache.delete('catalog:event-types');
}

function invalidateQuestionsCache() {
    catalogCache.delete('catalog:questions');
}

module.exports = {
    getUserTypes,
    getStates,
    getOtpTypes,
    getOtpTypeById,
    getCategories,
    getBrands,
    getCurrencies,
    getBreeds,
    getSexes,
    getRequestTypes,
    getResponseTypes,
    getTrackingTypes,
    getEventTypes,
    getQuestions,
    invalidateUserTypesCache,
    invalidateStatesCache,
    invalidateOtpTypesCache,
    invalidateCategoriesCache,
    invalidateBrandsCache,
    invalidateCurrenciesCache,
    invalidateBreedsCache,
    invalidateSexesCache,
    invalidateRequestTypesCache,
    invalidateResponseTypesCache,
    invalidateTrackingTypesCache,
    invalidateEventTypesCache,
    invalidateQuestionsCache
};
