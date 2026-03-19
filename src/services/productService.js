const categoryRepository = require('../repositories/categoryRepository');
const brandRepository = require('../repositories/brandRepository');
const productRepository = require('../repositories/productRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const PRODUCT_LIST_CACHE_KEY = 'product:list';
const PRODUCT_DETAIL_CACHE_PREFIX = 'product:detail:';
const PRODUCT_CACHE_TTL_MS = Number(process.env.PRODUCT_CACHE_TTL_MS || 15000);
const productQueryCache = new MemoryCache({ defaultTtlMs: PRODUCT_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getProductDetailCacheKey(idProducto) {
    return `${PRODUCT_DETAIL_CACHE_PREFIX}${String(idProducto).trim()}`;
}

function invalidateProductCache(idProducto) {
    productQueryCache.delete(PRODUCT_LIST_CACHE_KEY);

    if (idProducto !== undefined && idProducto !== null) {
        productQueryCache.delete(getProductDetailCacheKey(idProducto));
        return;
    }

    productQueryCache.clearByPrefix(PRODUCT_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idProducto = null) {
    invalidateProductCache(idProducto);
    catalogService.invalidateProductsCache();
}

function formatProduct(product) {
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
        idEstado: product.ID_ESTADO,
        estado: product.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCategoryExists(idCategoria) {
    const category = await categoryRepository.findCategoryById(idCategoria);

    if (!category) {
        throw createHttpError('Category not found', 400);
    }

    return category;
}

async function ensureBrandExists(idMarca) {
    const brand = await brandRepository.findBrandById(idMarca);

    if (!brand) {
        throw createHttpError('Brand not found', 400);
    }

    return brand;
}

async function ensureProductAssignmentsAreValid({ category, brand, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(category.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep a product active under an inactive category',
            409
        );
    }

    if (Number(brand.ID_ESTADO) !== 1) {
        throw createHttpError(
            'Cannot keep a product active under an inactive brand',
            409
        );
    }
}

function ensureValidPrice(precio) {
    if (!Number.isFinite(precio) || precio <= 0) {
        throw createHttpError('Price must be greater than zero', 400);
    }
}

async function ensureProductCanBeDisabled(existingProduct, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingProduct.idEstado) !== 1) {
        return;
    }

    if (Number(existingProduct.stock || 0) > 0) {
        throw createHttpError(
            'Cannot deactivate a product that still has stock available',
            409
        );
    }
}

async function ensureProductCanBeDeleted(existingProduct) {
    if (Number(existingProduct.idEstado) !== 1) {
        throw createHttpError('Product is already inactive', 409);
    }

    if (Number(existingProduct.stock || 0) > 0) {
        throw createHttpError(
            'Cannot delete a product that still has stock available',
            409
        );
    }
}

async function getProducts() {
    return productQueryCache.getOrSet(PRODUCT_LIST_CACHE_KEY, async () => {
        const products = await productRepository.findAllProductsForAdmin();
        return products.map(formatProduct);
    });
}

async function getProductById(idProducto) {
    return productQueryCache.getOrSet(getProductDetailCacheKey(idProducto), async () => {
        const product = await productRepository.findProductById(idProducto);

        if (!product) {
            throw createHttpError('Product not found', 404);
        }

        return formatProduct(product);
    });
}

async function createProduct(productData) {
    const payload = {
        nombre: String(productData.nombre || '').trim(),
        descripcion: String(productData.descripcion || '').trim() || null,
        precio: Number(productData.precio),
        idCategoria: Number(productData.idCategoria),
        idMarca: Number(productData.idMarca),
        idEstado: Number(productData.idEstado)
    };

    ensureValidPrice(payload.precio);
    await ensureStateExists(payload.idEstado);
    const category = await ensureCategoryExists(payload.idCategoria);
    const brand = await ensureBrandExists(payload.idMarca);
    await ensureProductAssignmentsAreValid({
        category,
        brand,
        nextState: payload.idEstado
    });

    const result = await productRepository.createProduct(payload);
    invalidateRelatedCaches(result.idProducto);

    return getProductById(result.idProducto);
}

async function updateProduct(idProducto, productData) {
    const existingProduct = await getProductById(idProducto);
    const payload = {
        idProducto: Number(idProducto),
        nombre: String(productData.nombre || '').trim(),
        descripcion: String(productData.descripcion || '').trim() || null,
        precio: Number(productData.precio),
        idCategoria: Number(productData.idCategoria),
        idMarca: Number(productData.idMarca),
        idEstado: Number(productData.idEstado)
    };

    ensureValidPrice(payload.precio);
    await ensureStateExists(payload.idEstado);
    const category = await ensureCategoryExists(payload.idCategoria);
    const brand = await ensureBrandExists(payload.idMarca);
    await ensureProductAssignmentsAreValid({
        category,
        brand,
        nextState: payload.idEstado
    });
    await ensureProductCanBeDisabled(existingProduct, payload.idEstado);

    await productRepository.updateProduct(payload);
    invalidateRelatedCaches(payload.idProducto);

    return getProductById(payload.idProducto);
}

async function deleteProduct(idProducto) {
    const existingProduct = await getProductById(idProducto);

    await ensureProductCanBeDeleted(existingProduct);
    await productRepository.deleteProduct(idProducto);
    invalidateRelatedCaches(idProducto);
}

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    invalidateProductReadCaches: invalidateRelatedCaches
};
