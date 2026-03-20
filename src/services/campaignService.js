const catalogService = require('./catalogService');
const campaignRepository = require('../repositories/campaignRepository');
const MemoryCache = require('../utils/memoryCache');

const CAMPAIGN_LIST_CACHE_KEY = 'campaign:list';
const CAMPAIGN_DETAIL_CACHE_PREFIX = 'campaign:detail:';
const CAMPAIGN_CACHE_TTL_MS = Number(process.env.CAMPAIGN_CACHE_TTL_MS || 15000);
const campaignQueryCache = new MemoryCache({
    defaultTtlMs: CAMPAIGN_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getCampaignDetailCacheKey(idCampania) {
    return `${CAMPAIGN_DETAIL_CACHE_PREFIX}${String(idCampania).trim()}`;
}

function invalidateCampaignCache(idCampania) {
    campaignQueryCache.delete(CAMPAIGN_LIST_CACHE_KEY);

    if (idCampania !== undefined && idCampania !== null) {
        campaignQueryCache.delete(getCampaignDetailCacheKey(idCampania));
        return;
    }

    campaignQueryCache.clearByPrefix(CAMPAIGN_DETAIL_CACHE_PREFIX);
}

function serializeDateOnly(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
            return trimmedValue;
        }

        const parsedDate = new Date(trimmedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(parsedDate.getUTCDate()).padStart(2, '0')}`;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
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

function normalizeCampaignName(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
}

function ensureValidDateRange(fechaInicio, fechaFin) {
    const startDate = new Date(fechaInicio);
    const endDate = new Date(fechaFin);

    if (endDate.getTime() < startDate.getTime()) {
        throw createHttpError(
            'Campaign end date cannot be earlier than start date',
            409
        );
    }
}

function formatCampaign(campaign) {
    return {
        idCampania: Number(campaign.ID_CAMPANIA),
        nombre: campaign.NOMBRE || '',
        descripcion: campaign.DESCRIPCION || '',
        fechaInicio: serializeDateOnly(campaign.FECHA_INICIO),
        fechaFin: serializeDateOnly(campaign.FECHA_FIN),
        idEstado: Number(campaign.ID_ESTADO),
        estado: campaign.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureCampaignNameIsAvailable(nombre, { excludeId = null } = {}) {
    const normalizedName = normalizeCampaignName(nombre);
    const campaigns = await getCampaigns();
    const duplicatedCampaign = campaigns.find(
        (campaign) =>
            normalizeCampaignName(campaign.nombre) === normalizedName &&
            Number(campaign.idCampania) !== Number(excludeId)
    );

    if (duplicatedCampaign) {
        throw createHttpError('Campaign name already exists', 409);
    }
}

async function ensureCampaignCanBeDisabled(existingCampaign, nextState) {
    if (Number(nextState) === 1) {
        return;
    }

    if (Number(existingCampaign.idEstado) !== 1) {
        return;
    }

    const activeDonationsCount = await campaignRepository.countActiveDonationsByCampaign(
        existingCampaign.idCampania
    );

    if (activeDonationsCount > 0) {
        throw createHttpError(
            'Cannot deactivate a campaign that still has active donations',
            409
        );
    }
}

async function ensureCampaignCanBeDeleted(existingCampaign) {
    if (Number(existingCampaign.idEstado) !== 1) {
        throw createHttpError('Campaign is already inactive', 409);
    }

    const activeDonationsCount = await campaignRepository.countActiveDonationsByCampaign(
        existingCampaign.idCampania
    );

    if (activeDonationsCount > 0) {
        throw createHttpError(
            'Cannot delete a campaign that still has active donations',
            409
        );
    }
}

async function getCampaigns() {
    return campaignQueryCache.getOrSet(CAMPAIGN_LIST_CACHE_KEY, async () => {
        const campaigns = await campaignRepository.findAllCampaignsForAdmin();
        return campaigns.map(formatCampaign);
    });
}

async function getCampaignById(idCampania) {
    return campaignQueryCache.getOrSet(getCampaignDetailCacheKey(idCampania), async () => {
        const campaign = await campaignRepository.findCampaignById(idCampania);

        if (!campaign) {
            throw createHttpError('Campaign not found', 404);
        }

        return formatCampaign(campaign);
    });
}

async function createCampaign(campaignData) {
    const requestedState =
        campaignData.idEstado === undefined ||
        campaignData.idEstado === null ||
        campaignData.idEstado === ''
            ? 1
            : Number(campaignData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New campaigns must start in active state', 400);
    }

    const payload = {
        nombre: String(campaignData.nombre || '').trim(),
        descripcion: normalizeOptionalText(campaignData.descripcion),
        fechaInicio: parseDateValue(campaignData.fechaInicio, 'Start date'),
        fechaFin: parseDateValue(campaignData.fechaFin, 'End date'),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    ensureValidDateRange(payload.fechaInicio, payload.fechaFin);
    await ensureCampaignNameIsAvailable(payload.nombre);

    const result = await campaignRepository.createCampaign(payload);
    invalidateCampaignCache(result.idCampania);

    return getCampaignById(result.idCampania);
}

async function updateCampaign(idCampania, campaignData) {
    const existingCampaign = await getCampaignById(idCampania);
    const payload = {
        idCampania: Number(idCampania),
        nombre: String(campaignData.nombre || '').trim(),
        descripcion: normalizeOptionalText(campaignData.descripcion),
        fechaInicio: parseDateValue(campaignData.fechaInicio, 'Start date'),
        fechaFin: parseDateValue(campaignData.fechaFin, 'End date'),
        idEstado: Number(campaignData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    ensureValidDateRange(payload.fechaInicio, payload.fechaFin);
    await ensureCampaignNameIsAvailable(payload.nombre, {
        excludeId: payload.idCampania
    });
    await ensureCampaignCanBeDisabled(existingCampaign, payload.idEstado);

    await campaignRepository.updateCampaign(payload);
    invalidateCampaignCache(payload.idCampania);

    return getCampaignById(payload.idCampania);
}

async function deleteCampaign(idCampania) {
    const existingCampaign = await getCampaignById(idCampania);

    await ensureCampaignCanBeDeleted(existingCampaign);
    await campaignRepository.deleteCampaign(idCampania);
    invalidateCampaignCache(idCampania);
}

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    invalidateCampaignReadCaches: invalidateCampaignCache
};
