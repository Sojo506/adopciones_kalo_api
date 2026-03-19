const brandRepository = require('../repositories/brandRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const BRAND_LIST_CACHE_KEY = 'brand:list';
const BRAND_DETAIL_CACHE_PREFIX = 'brand:detail:';
const BRAND_CACHE_TTL_MS = Number(process.env.BRAND_CACHE_TTL_MS || 15000);
const brandQueryCache = new MemoryCache({ defaultTtlMs: BRAND_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeBrandName(value) {
    return String(value || '').trim().toLowerCase();
}

function getBrandDetailCacheKey(idMarca) {
    return `${BRAND_DETAIL_CACHE_PREFIX}${String(idMarca).trim()}`;
}

function invalidateBrandCache(idMarca) {
    brandQueryCache.delete(BRAND_LIST_CACHE_KEY);

    if (idMarca !== undefined && idMarca !== null) {
        brandQueryCache.delete(getBrandDetailCacheKey(idMarca));
        return;
    }

    brandQueryCache.clearByPrefix(BRAND_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idMarca = null) {
    invalidateBrandCache(idMarca);
    catalogService.invalidateBrandsCache();
}

function formatBrand(brand) {
    return {
        idMarca: brand.ID_MARCA,
        nombre: brand.NOMBRE,
        idEstado: brand.ID_ESTADO,
        estado: brand.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureBrandNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeBrandName(nombre);
    const brands = await getBrands();
    const duplicatedBrand = brands.find(
        (brand) =>
            normalizeBrandName(brand.nombre) === normalizedName &&
            Number(brand.idMarca) !== Number(excludeId)
    );

    if (duplicatedBrand) {
        throw createHttpError('Brand name already exists', 409);
    }
}

async function ensureBrandCanBeDisabled(existingBrand, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingBrand.idEstado) !== 1) {
        return;
    }

    const activeProductsCount = await brandRepository.countActiveProductsByBrand(
        existingBrand.idMarca
    );

    if (activeProductsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a brand that still has active products',
            409
        );
    }
}

async function ensureBrandCanBeDeleted(existingBrand) {
    if (Number(existingBrand.idEstado) !== 1) {
        throw createHttpError('Brand is already inactive', 409);
    }

    const activeProductsCount = await brandRepository.countActiveProductsByBrand(
        existingBrand.idMarca
    );

    if (activeProductsCount > 0) {
        throw createHttpError(
            'Cannot delete a brand that still has active products',
            409
        );
    }
}

async function getBrands() {
    return brandQueryCache.getOrSet(BRAND_LIST_CACHE_KEY, async () => {
        const brands = await brandRepository.findAllBrandsForAdmin();
        return brands.map(formatBrand);
    });
}

async function getBrandById(idMarca) {
    return brandQueryCache.getOrSet(getBrandDetailCacheKey(idMarca), async () => {
        const brand = await brandRepository.findBrandById(idMarca);

        if (!brand) {
            throw createHttpError('Brand not found', 404);
        }

        return formatBrand(brand);
    });
}

async function createBrand(brandData) {
    const payload = {
        nombre: String(brandData.nombre || '').trim(),
        idEstado: Number(brandData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureBrandNameIsAvailable(payload.nombre);

    const result = await brandRepository.createBrand(payload);
    invalidateRelatedCaches(result.idMarca);

    return getBrandById(result.idMarca);
}

async function updateBrand(idMarca, brandData) {
    const existingBrand = await getBrandById(idMarca);
    const payload = {
        idMarca: Number(idMarca),
        nombre: String(brandData.nombre || '').trim(),
        idEstado: Number(brandData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureBrandNameIsAvailable(payload.nombre, { excludeId: payload.idMarca });
    await ensureBrandCanBeDisabled(existingBrand, payload.idEstado);

    await brandRepository.updateBrand(payload);
    invalidateRelatedCaches(payload.idMarca);

    return getBrandById(payload.idMarca);
}

async function deleteBrand(idMarca) {
    const existingBrand = await getBrandById(idMarca);

    await ensureBrandCanBeDeleted(existingBrand);
    await brandRepository.deleteBrand(idMarca);
    invalidateRelatedCaches(idMarca);
}

module.exports = {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
