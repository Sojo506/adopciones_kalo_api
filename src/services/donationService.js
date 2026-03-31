const campaignRepository = require('../repositories/campaignRepository');
const donationRepository = require('../repositories/donationRepository');
const userRepository = require('../repositories/userRepository');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');
const { isInactiveState } = require('../utils/stateIds');

const DONATION_LIST_CACHE_KEY = 'donation:list';
const DONATION_DETAIL_CACHE_PREFIX = 'donation:detail:';
const DONATION_CACHE_TTL_MS = Number(process.env.DONATION_CACHE_TTL_MS || 15000);
const donationQueryCache = new MemoryCache({ defaultTtlMs: DONATION_CACHE_TTL_MS });

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getDonationDetailCacheKey(idDonacion) {
    return `${DONATION_DETAIL_CACHE_PREFIX}${String(idDonacion).trim()}`;
}

function invalidateDonationCache(idDonacion) {
    donationQueryCache.delete(DONATION_LIST_CACHE_KEY);

    if (idDonacion !== undefined && idDonacion !== null) {
        donationQueryCache.delete(getDonationDetailCacheKey(idDonacion));
        return;
    }

    donationQueryCache.clearByPrefix(DONATION_DETAIL_CACHE_PREFIX);
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

function parseAmountValue(value) {
    const amount = Number(value);

    if (!Number.isFinite(amount) || amount <= 0) {
        throw createHttpError('Donation amount must be greater than 0', 400);
    }

    return Math.round(amount * 100) / 100;
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
}

function formatDonation(donation) {
    return {
        idDonacion: Number(donation.ID_DONACION),
        identificacion: Number(donation.IDENTIFICACION),
        donador: donation.DONADOR || null,
        idCampania: Number(donation.ID_CAMPANIA),
        campania: donation.CAMPANIA || null,
        monto: Number(donation.MONTO || 0),
        fechaDonacion: serializeDateOnly(donation.FECHA_DONACION),
        mensaje: donation.MENSAJE || '',
        idEstado: Number(donation.ID_ESTADO),
        estado: donation.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureUserExists(identificacion) {
    const user = await userRepository.findByIdentification(identificacion);

    if (!user) {
        throw createHttpError('User not found', 404);
    }

    return {
        identificacion: Number(user.IDENTIFICACION),
        idEstado: Number(user.ID_ESTADO),
        nombre: [user.NOMBRE, user.APELLIDO_PATERNO, user.APELLIDO_MATERNO]
            .filter(Boolean)
            .join(' ') || null
    };
}

async function ensureCampaignExists(idCampania) {
    const campaign = await campaignRepository.findCampaignById(idCampania);

    if (!campaign) {
        throw createHttpError('Campaign not found', 404);
    }

    return {
        idCampania: Number(campaign.ID_CAMPANIA),
        nombre: campaign.NOMBRE || null,
        idEstado: Number(campaign.ID_ESTADO),
        fechaInicio: serializeDateOnly(campaign.FECHA_INICIO),
        fechaFin: serializeDateOnly(campaign.FECHA_FIN)
    };
}

function ensureActiveDonationCanUseUser(user, donationState) {
    if (Number(donationState) !== 1) {
        return;
    }

    if (Number(user.idEstado) !== 1) {
        throw createHttpError('Cannot keep a donation active for an inactive user', 409);
    }
}

function ensureActiveDonationCanUseCampaign(campaign, donationState) {
    if (Number(donationState) !== 1) {
        return;
    }

    if (Number(campaign.idEstado) !== 1) {
        throw createHttpError('Cannot keep a donation active for an inactive campaign', 409);
    }
}

function ensureDonationDateFitsCampaign(campaign, fechaDonacion) {
    const donationDate = serializeDateOnly(fechaDonacion);

    if (campaign.fechaInicio && donationDate < campaign.fechaInicio) {
        throw createHttpError('Donation date cannot be earlier than campaign start date', 409);
    }

    if (campaign.fechaFin && donationDate > campaign.fechaFin) {
        throw createHttpError('Donation date cannot be later than campaign end date', 409);
    }
}

async function ensureDonationCanBeDisabled(existingDonation, nextState) {
    if (!isInactiveState(nextState)) {
        return;
    }

    if (isInactiveState(existingDonation.idEstado)) {
        return;
    }

    const activeInvoicesCount = await donationRepository.countActiveDonationInvoices(
        existingDonation.idDonacion
    );

    if (activeInvoicesCount > 0) {
        throw createHttpError(
            'Cannot deactivate a donation that still has active invoices',
            409
        );
    }
}

async function ensureDonationAmountCanBeChanged(existingDonation, nextAmount) {
    if (Number(existingDonation.monto) === Number(nextAmount)) {
        return;
    }

    const activeInvoicesCount = await donationRepository.countActiveDonationInvoices(
        existingDonation.idDonacion
    );

    if (activeInvoicesCount > 0) {
        throw createHttpError(
            'Cannot change donation amount while it still has active invoices',
            409
        );
    }
}

async function ensureDonationCanBeDeleted(existingDonation) {
    if (isInactiveState(existingDonation.idEstado)) {
        throw createHttpError('Donation is already inactive', 409);
    }

    const activeInvoicesCount = await donationRepository.countActiveDonationInvoices(
        existingDonation.idDonacion
    );

    if (activeInvoicesCount > 0) {
        throw createHttpError(
            'Cannot delete a donation that still has active invoices',
            409
        );
    }
}

async function createPublicDonation(donationData, identificacion) {
    const payload = {
        identificacion: Number(identificacion),
        idCampania: Number(donationData.idCampania),
        monto: parseAmountValue(donationData.monto),
        fechaDonacion: new Date(),
        mensaje: normalizeOptionalText(donationData.mensaje),
        idEstado: 1
    };

    await ensureStateExists(payload.idEstado);
    const [user, campaign] = await Promise.all([
        ensureUserExists(payload.identificacion),
        ensureCampaignExists(payload.idCampania)
    ]);

    ensureActiveDonationCanUseUser(user, payload.idEstado);
    ensureActiveDonationCanUseCampaign(campaign, payload.idEstado);
    ensureDonationDateFitsCampaign(campaign, payload.fechaDonacion);

    const result = await donationRepository.createDonation(payload);
    invalidateDonationCache(result.idDonacion);

    return getDonationById(result.idDonacion);
}

async function getDonations() {
    return donationQueryCache.getOrSet(DONATION_LIST_CACHE_KEY, async () => {
        const donations = await donationRepository.findAllDonations();
        return donations.map(formatDonation);
    });
}

async function getDonationById(idDonacion) {
    return donationQueryCache.getOrSet(getDonationDetailCacheKey(idDonacion), async () => {
        const donation = await donationRepository.findDonationById(idDonacion);

        if (!donation) {
            throw createHttpError('Donation not found', 404);
        }

        return formatDonation(donation);
    });
}

async function createDonation(donationData) {
    const payload = {
        identificacion: Number(donationData.identificacion),
        idCampania: Number(donationData.idCampania),
        monto: parseAmountValue(donationData.monto),
        fechaDonacion: parseDateValue(donationData.fechaDonacion, 'Donation date'),
        mensaje: normalizeOptionalText(donationData.mensaje),
        idEstado: Number(donationData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [user, campaign] = await Promise.all([
        ensureUserExists(payload.identificacion),
        ensureCampaignExists(payload.idCampania)
    ]);

    ensureActiveDonationCanUseUser(user, payload.idEstado);
    ensureActiveDonationCanUseCampaign(campaign, payload.idEstado);
    ensureDonationDateFitsCampaign(campaign, payload.fechaDonacion);

    const result = await donationRepository.createDonation(payload);
    invalidateDonationCache(result.idDonacion);

    return getDonationById(result.idDonacion);
}

async function updateDonation(idDonacion, donationData) {
    const existingDonation = await getDonationById(idDonacion);
    const payload = {
        idDonacion: Number(idDonacion),
        identificacion: Number(donationData.identificacion),
        idCampania: Number(donationData.idCampania),
        monto: parseAmountValue(donationData.monto),
        fechaDonacion: parseDateValue(donationData.fechaDonacion, 'Donation date'),
        mensaje: normalizeOptionalText(donationData.mensaje),
        idEstado: Number(donationData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const [user, campaign] = await Promise.all([
        ensureUserExists(payload.identificacion),
        ensureCampaignExists(payload.idCampania)
    ]);

    ensureActiveDonationCanUseUser(user, payload.idEstado);
    ensureActiveDonationCanUseCampaign(campaign, payload.idEstado);
    ensureDonationDateFitsCampaign(campaign, payload.fechaDonacion);
    await ensureDonationAmountCanBeChanged(existingDonation, payload.monto);
    await ensureDonationCanBeDisabled(existingDonation, payload.idEstado);

    await donationRepository.updateDonation(payload);
    invalidateDonationCache(payload.idDonacion);

    return getDonationById(payload.idDonacion);
}

async function deleteDonation(idDonacion) {
    const existingDonation = await getDonationById(idDonacion);

    await ensureDonationCanBeDeleted(existingDonation);
    await donationRepository.deleteDonation(idDonacion);
    invalidateDonationCache(idDonacion);
}

module.exports = {
    createPublicDonation,
    getDonations,
    getDonationById,
    createDonation,
    updateDonation,
    deleteDonation,
    invalidateDonationReadCaches: invalidateDonationCache
};
