const cloudinary = require('../config/cloudinary');
const catalogService = require('./catalogService');
const campaignRepository = require('../repositories/campaignRepository');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const CAMPAIGN_LIST_CACHE_KEY = 'campaign:list';
const CAMPAIGN_PUBLIC_LIST_CACHE_KEY = 'campaign:public:list';
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
    campaignQueryCache.delete(CAMPAIGN_PUBLIC_LIST_CACHE_KEY);

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

function normalizeOptionalImageUrl(value) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        return null;
    }

    let parsedUrl;

    try {
        parsedUrl = new URL(normalizedValue);
    } catch (error) {
        throw createHttpError('Image URL is invalid', 400);
    }

    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw createHttpError('Image URL must use HTTP or HTTPS', 400);
    }

    return normalizedValue;
}

function sanitizeFileName(fileName) {
    return String(fileName || 'campaign')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'campaign';
}

function ensureCloudinaryConfiguration() {
    const missingConfigKeys = [
        ['CLOUDINARY_CLOUD_NAME', 'CLOUD_NAME'],
        ['CLOUDINARY_API_KEY', 'CLOUD_API_KEY'],
        ['CLOUDINARY_API_SECRET', 'CLOUD_API_SECRET']
    ]
        .filter(([primaryKey, fallbackKey]) => !process.env[primaryKey] && !process.env[fallbackKey])
        .map(([primaryKey, fallbackKey]) => `${primaryKey} (or ${fallbackKey})`);

    if (missingConfigKeys.length) {
        throw createHttpError(
            `Missing Cloudinary configuration: ${missingConfigKeys.join(', ')}`,
            500
        );
    }
}

async function uploadImageToCloudinary(file, campaignName) {
    ensureCloudinaryConfiguration();

    const folder = process.env.CLOUDINARY_CAMPAIGN_IMAGES_FOLDER || 'kalo/campaign-images';
    const publicId = `campaign-${Date.now()}-${sanitizeFileName(
        campaignName || file.originalname
    )}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
}

async function destroyCloudinaryAsset(publicId) {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
        console.error('Failed to clean Cloudinary asset:', error);
    }
}

function ensureCampaignHasImage(imageUrl) {
    if (!imageUrl) {
        throw createHttpError('Image file is required', 400);
    }
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
        imageUrl: campaign.IMAGE_URL || null,
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
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingCampaign.idEstado)) {
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
    if (isInactiveState(existingCampaign.idEstado)) {
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

async function getActiveCampaigns() {
    return campaignQueryCache.getOrSet(CAMPAIGN_PUBLIC_LIST_CACHE_KEY, async () => {
        const campaigns = await campaignRepository.findPublicCampaigns();
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

async function createCampaign(campaignData, file) {
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

    const imageUrlFromBody = normalizeOptionalImageUrl(campaignData.imageUrl);
    let uploadedImage = null;
    let imageUrl = imageUrlFromBody;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.nombre);
        imageUrl = uploadedImage.secure_url;
    }

    ensureCampaignHasImage(imageUrl);

    try {
        const result = await campaignRepository.createCampaign({
            ...payload,
            imageUrl
        });
        invalidateCampaignCache(result.idCampania);

        return getCampaignById(result.idCampania);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
}

async function updateCampaign(idCampania, campaignData, file) {
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

    const hasImageUrlField = Object.prototype.hasOwnProperty.call(
        campaignData,
        'imageUrl'
    );
    const nextManualImageUrl = normalizeOptionalImageUrl(campaignData.imageUrl);
    let uploadedImage = null;
    let nextImageUrl = existingCampaign.imageUrl;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.nombre);
        nextImageUrl = uploadedImage.secure_url;
    } else if (hasImageUrlField) {
        nextImageUrl = nextManualImageUrl;
    }

    ensureCampaignHasImage(nextImageUrl);

    try {
        await campaignRepository.updateCampaign({
            ...payload,
            imageUrl: nextImageUrl
        });
        invalidateCampaignCache(payload.idCampania);

        return getCampaignById(payload.idCampania);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
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
    getActiveCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    invalidateCampaignReadCaches: invalidateCampaignCache
};
