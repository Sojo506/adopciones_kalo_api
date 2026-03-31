const catalogService = require('./catalogService');
const categoryRepository = require('../repositories/categoryRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const CATEGORY_LIST_CACHE_KEY = 'category:list';
const CATEGORY_DETAIL_CACHE_PREFIX = 'category:detail:';
const CATEGORY_CACHE_TTL_MS = Number(process.env.CATEGORY_CACHE_TTL_MS || 15000);
const categoryQueryCache = new MemoryCache({ defaultTtlMs: CATEGORY_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeCategoryName(value) {
    return String(value || '').trim().toLowerCase();
}

function getCategoryDetailCacheKey(idCategoria) {
    return `${CATEGORY_DETAIL_CACHE_PREFIX}${String(idCategoria).trim()}`;
}

function invalidateCategoryCache(idCategoria) {
    categoryQueryCache.delete(CATEGORY_LIST_CACHE_KEY);

    if (idCategoria !== undefined && idCategoria !== null) {
        categoryQueryCache.delete(getCategoryDetailCacheKey(idCategoria));
        return;
    }

    categoryQueryCache.clearByPrefix(CATEGORY_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idCategoria = null) {
    invalidateCategoryCache(idCategoria);
    catalogService.invalidateCategoriesCache();
}

function formatCategory(category) {
    return {
        idCategoria: category.ID_CATEGORIA,
        nombre: category.NOMBRE,
        idEstado: category.ID_ESTADO,
        estado: category.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCategoryNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeCategoryName(nombre);
    const categories = await getCategories();
    const duplicatedCategory = categories.find(
        (category) =>
            normalizeCategoryName(category.nombre) === normalizedName &&
            Number(category.idCategoria) !== Number(excludeId)
    );

    if (duplicatedCategory) {
        throw createHttpError('Category name already exists', 409);
    }
}

async function ensureCategoryCanBeDisabled(existingCategory, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingCategory.idEstado)) {
        return;
    }

    const activeProductsCount = await categoryRepository.countActiveProductsByCategory(
        existingCategory.idCategoria
    );

    if (activeProductsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a category that still has active products',
            409
        );
    }
}

async function ensureCategoryCanBeDeleted(existingCategory) {
    if (isInactiveState(existingCategory.idEstado)) {
        throw createHttpError('Category is already inactive', 409);
    }

    const activeProductsCount = await categoryRepository.countActiveProductsByCategory(
        existingCategory.idCategoria
    );

    if (activeProductsCount > 0) {
        throw createHttpError(
            'Cannot delete a category that still has active products',
            409
        );
    }
}

async function getCategories() {
    return categoryQueryCache.getOrSet(CATEGORY_LIST_CACHE_KEY, async () => {
        const categories = await categoryRepository.findAllCategoriesForAdmin();
        return categories.map(formatCategory);
    });
}

async function getCategoryById(idCategoria) {
    return categoryQueryCache.getOrSet(getCategoryDetailCacheKey(idCategoria), async () => {
        const category = await categoryRepository.findCategoryById(idCategoria);

        if (!category) {
            throw createHttpError('Category not found', 404);
        }

        return formatCategory(category);
    });
}

async function createCategory(categoryData) {
    const payload = {
        nombre: String(categoryData.nombre || '').trim(),
        idEstado: Number(categoryData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCategoryNameIsAvailable(payload.nombre);

    const result = await categoryRepository.createCategory(payload);
    invalidateRelatedCaches(result.idCategoria);

    return getCategoryById(result.idCategoria);
}

async function updateCategory(idCategoria, categoryData) {
    const existingCategory = await getCategoryById(idCategoria);
    const payload = {
        idCategoria: Number(idCategoria),
        nombre: String(categoryData.nombre || '').trim(),
        idEstado: Number(categoryData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    await ensureCategoryNameIsAvailable(payload.nombre, { excludeId: payload.idCategoria });
    await ensureCategoryCanBeDisabled(existingCategory, payload.idEstado);

    await categoryRepository.updateCategory(payload);
    invalidateRelatedCaches(payload.idCategoria);

    return getCategoryById(payload.idCategoria);
}

async function deleteCategory(idCategoria) {
    const existingCategory = await getCategoryById(idCategoria);

    await ensureCategoryCanBeDeleted(existingCategory);
    await categoryRepository.deleteCategory(idCategoria);
    invalidateRelatedCaches(idCategoria);
}

module.exports = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
};
