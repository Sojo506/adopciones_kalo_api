const catalogRepository = require('../repositories/catalogRepository');
const productImageRepository = require('../repositories/productImageRepository');
const MemoryCache = require('../utils/memoryCache');
const { ACTIVE_STATE_ID } = require('../utils/stateIds');

const ONE_HOUR_MS = 60 * 60 * 1000;
const catalogCache = new MemoryCache({ defaultTtlMs: ONE_HOUR_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function sortCatalogItemsByName(left, right) {
    return String(left.nombre || '').localeCompare(String(right.nombre || ''), 'es', {
        sensitivity: 'base'
    });
}

function buildUniqueCatalogItems(products, { idKey, nameKey }) {
    const itemsById = new Map();

    products.forEach((product) => {
        const itemId = product[idKey];
        const itemName = product[nameKey];

        if (itemId === undefined || itemId === null || !itemName) {
            return;
        }

        if (!itemsById.has(itemId)) {
            itemsById.set(itemId, {
                [idKey]: itemId,
                nombre: itemName
            });
        }
    });

    return Array.from(itemsById.values()).sort(sortCatalogItemsByName);
}

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

async function getMovementTypes() {
    return catalogCache.getOrSet('catalog:movement-types', async () => {
        const movementTypes = await catalogRepository.findMovementTypes();
        return movementTypes.map((movementType) => ({
            idTipoMovimiento: movementType.ID_TIPO_MOVIMIENTO,
            nombre: movementType.NOMBRE,
            idEstado: movementType.ID_ESTADO
        }));
    });
}

function formatCatalogProduct(product) {
    return {
        idProducto: product.ID_PRODUCTO,
        nombre: product.NOMBRE,
        descripcion: product.DESCRIPCION || null,
        precio: product.PRECIO === null || product.PRECIO === undefined
            ? null
            : Number(product.PRECIO),
        idCategoria: product.ID_CATEGORIA,
        categoria: product.CATEGORIA || null,
        idMarca: product.ID_MARCA,
        marca: product.MARCA || null,
        stock: Number(product.STOCK || 0),
        imageUrl: product.IMAGE_URL || null,
        idEstado: product.ID_ESTADO
    };
}

async function getProducts({ force = false } = {}) {
    if (force) {
        const products = await catalogRepository.findProducts();
        return products.map(formatCatalogProduct);
    }

    return catalogCache.getOrSet('catalog:products', async () => {
        const products = await catalogRepository.findProducts();
        return products.map(formatCatalogProduct);
    });
}

async function getProductById(idProducto, { force = false } = {}) {
    const products = await getProducts({ force });
    const product = products.find(
        (currentProduct) => Number(currentProduct.idProducto) === Number(idProducto)
    );

    if (!product) {
        throw createHttpError('Product not found', 404);
    }

    const productImages = await productImageRepository.findProductImagesByProductId(idProducto);
    const imagenes = productImages
        .filter((productImage) => Number(productImage.ID_ESTADO) === ACTIVE_STATE_ID)
        .map((productImage) => ({
            idImagen: productImage.ID_IMAGEN,
            imageUrl: productImage.IMAGE_URL || null
        }))
        .filter((productImage) => productImage.imageUrl);

    return {
        ...product,
        imageUrl: product.imageUrl || imagenes[0]?.imageUrl || null,
        imagenes
    };
}

async function getStoreCatalog({ force = false } = {}) {
    const products = await getProducts({ force });

    return {
        products,
        categories: buildUniqueCatalogItems(products, {
            idKey: 'idCategoria',
            nameKey: 'categoria'
        }),
        brands: buildUniqueCatalogItems(products, {
            idKey: 'idMarca',
            nameKey: 'marca'
        })
    };
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

function invalidateMovementTypesCache() {
    catalogCache.delete('catalog:movement-types');
}

function invalidateProductsCache() {
    catalogCache.delete('catalog:products');
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
    getMovementTypes,
    getProducts,
    getProductById,
    getStoreCatalog,
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
    invalidateMovementTypesCache,
    invalidateProductsCache,
    invalidateCurrenciesCache,
    invalidateBreedsCache,
    invalidateSexesCache,
    invalidateRequestTypesCache,
    invalidateResponseTypesCache,
    invalidateTrackingTypesCache,
    invalidateEventTypesCache,
    invalidateQuestionsCache
};
