const catalogService = require('./catalogService');
const donationService = require('./donationService');
const donationInvoiceRepository = require('../repositories/donationInvoiceRepository');
const invoiceService = require('./invoiceService');
const MemoryCache = require('../utils/memoryCache');

const DONATION_INVOICE_LIST_CACHE_KEY = 'donation-invoice:list';
const DONATION_INVOICE_DETAIL_CACHE_PREFIX = 'donation-invoice:detail:';
const DONATION_INVOICE_CACHE_TTL_MS = Number(process.env.DONATION_INVOICE_CACHE_TTL_MS || 15000);
const donationInvoiceQueryCache = new MemoryCache({
    defaultTtlMs: DONATION_INVOICE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeInvoiceId(value) {
    return String(value || '').trim();
}

function normalizeDonationInvoiceKey(idDonacion, idFactura) {
    return `${String(idDonacion).trim()}:${normalizeInvoiceId(idFactura)}`;
}

function getDonationInvoiceDetailCacheKey(idDonacion, idFactura) {
    return `${DONATION_INVOICE_DETAIL_CACHE_PREFIX}${normalizeDonationInvoiceKey(idDonacion, idFactura)}`;
}

function invalidateDonationInvoiceCache(idDonacion, idFactura) {
    donationInvoiceQueryCache.delete(DONATION_INVOICE_LIST_CACHE_KEY);

    if (
        idDonacion !== undefined &&
        idDonacion !== null &&
        idFactura !== undefined &&
        idFactura !== null
    ) {
        donationInvoiceQueryCache.delete(getDonationInvoiceDetailCacheKey(idDonacion, idFactura));
        return;
    }

    donationInvoiceQueryCache.clearByPrefix(DONATION_INVOICE_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idDonacion, idFactura) {
    invalidateDonationInvoiceCache(idDonacion, idFactura);
    donationService.invalidateDonationReadCaches(idDonacion);
    invoiceService.invalidateInvoiceQueryCaches(idFactura);
}

function formatDonationInvoiceBase(donationInvoice) {
    return {
        idDonacion: Number(donationInvoice.ID_DONACION),
        idFactura: normalizeInvoiceId(donationInvoice.ID_FACTURA),
        idEstado: Number(donationInvoice.ID_ESTADO),
        estado: donationInvoice.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureDonationExists(idDonacion) {
    return donationService.getDonationById(idDonacion);
}

async function ensureInvoiceExists(idFactura) {
    return invoiceService.getInvoiceById(idFactura);
}

function ensureActiveDonationInvoiceCanBeApplied({ donation, invoice, idEstado }) {
    if (Number(idEstado) !== 1) {
        return;
    }

    if (Number(donation.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a donation-invoice relation active for an inactive donation',
            409
        );
    }

    if (Number(invoice.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep a donation-invoice relation active for an inactive invoice',
            409
        );
    }
}

function hydrateDonationInvoice(baseDonationInvoice, donation, invoice) {
    return {
        ...baseDonationInvoice,
        identificacion: donation?.identificacion || null,
        donador: donation?.donador || null,
        campania: donation?.campania || null,
        montoDonacion: Number(donation?.monto || 0),
        fechaDonacion: donation?.fechaDonacion || null,
        mensaje: donation?.mensaje || '',
        moneda: invoice?.moneda || null,
        simbolo: invoice?.simbolo || null,
        totalFactura: Number(invoice?.total || 0),
        fechaFactura: invoice?.fechaFactura || null
    };
}

async function getDonationInvoices() {
    return donationInvoiceQueryCache.getOrSet(DONATION_INVOICE_LIST_CACHE_KEY, async () => {
        const [donationInvoices, donations, invoices] = await Promise.all([
            donationInvoiceRepository.findAllDonationInvoices(),
            donationService.getDonations(),
            invoiceService.getInvoices()
        ]);

        const donationsById = new Map(donations.map((donation) => [Number(donation.idDonacion), donation]));
        const invoicesById = new Map(
            invoices.map((invoice) => [normalizeInvoiceId(invoice.idFactura), invoice])
        );

        return donationInvoices.map((donationInvoice) => {
            const baseDonationInvoice = formatDonationInvoiceBase(donationInvoice);

            return hydrateDonationInvoice(
                baseDonationInvoice,
                donationsById.get(baseDonationInvoice.idDonacion) || null,
                invoicesById.get(normalizeInvoiceId(baseDonationInvoice.idFactura)) || null
            );
        });
    });
}

async function getDonationInvoiceByPk(idDonacion, idFactura) {
    return donationInvoiceQueryCache.getOrSet(
        getDonationInvoiceDetailCacheKey(idDonacion, idFactura),
        async () => {
            const donationInvoice = await donationInvoiceRepository.findDonationInvoiceByPk(
                idDonacion,
                idFactura
            );

            if (!donationInvoice) {
                throw createHttpError('Donation-invoice relation not found', 404);
            }

            const baseDonationInvoice = formatDonationInvoiceBase(donationInvoice);
            const [donation, invoice] = await Promise.all([
                ensureDonationExists(baseDonationInvoice.idDonacion),
                ensureInvoiceExists(baseDonationInvoice.idFactura)
            ]);

            return hydrateDonationInvoice(baseDonationInvoice, donation, invoice);
        }
    );
}

async function createDonationInvoice(donationInvoiceData) {
    const requestedState =
        donationInvoiceData.idEstado === undefined ||
        donationInvoiceData.idEstado === null ||
        donationInvoiceData.idEstado === ''
            ? 1
            : Number(donationInvoiceData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New donation-invoice relations must start in active state', 400);
    }

    const payload = {
        idDonacion: Number(donationInvoiceData.idDonacion),
        idFactura: normalizeInvoiceId(donationInvoiceData.idFactura),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const [donation, invoice] = await Promise.all([
        ensureDonationExists(payload.idDonacion),
        ensureInvoiceExists(payload.idFactura)
    ]);
    ensureActiveDonationInvoiceCanBeApplied({
        donation,
        invoice,
        idEstado: payload.idEstado
    });

    const existingDonationInvoice = await donationInvoiceRepository.findDonationInvoiceByPk(
        payload.idDonacion,
        payload.idFactura
    );

    if (existingDonationInvoice) {
        throw createHttpError('Donation-invoice relation already exists', 409);
    }

    await donationInvoiceRepository.createDonationInvoice(payload);
    invalidateRelatedCaches(payload.idDonacion, payload.idFactura);

    return getDonationInvoiceByPk(payload.idDonacion, payload.idFactura);
}

async function updateDonationInvoice(idDonacion, idFactura, donationInvoiceData) {
    const normalizedIdDonacion = Number(idDonacion);
    const normalizedIdFactura = normalizeInvoiceId(idFactura);
    const existingDonationInvoice = await getDonationInvoiceByPk(
        normalizedIdDonacion,
        normalizedIdFactura
    );
    const payload = {
        idDonacion: normalizedIdDonacion,
        idFactura: normalizedIdFactura,
        idEstado: Number(donationInvoiceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);

    if (Number(payload.idEstado) === 1) {
        const [donation, invoice] = await Promise.all([
            ensureDonationExists(payload.idDonacion),
            ensureInvoiceExists(payload.idFactura)
        ]);

        ensureActiveDonationInvoiceCanBeApplied({
            donation,
            invoice,
            idEstado: payload.idEstado
        });
    }

    await donationInvoiceRepository.updateDonationInvoice(payload);
    invalidateRelatedCaches(existingDonationInvoice.idDonacion, existingDonationInvoice.idFactura);

    return getDonationInvoiceByPk(payload.idDonacion, payload.idFactura);
}

async function deleteDonationInvoice(idDonacion, idFactura) {
    const existingDonationInvoice = await getDonationInvoiceByPk(idDonacion, idFactura);

    await donationInvoiceRepository.deleteDonationInvoice(idDonacion, idFactura);
    invalidateRelatedCaches(existingDonationInvoice.idDonacion, existingDonationInvoice.idFactura);
}

module.exports = {
    getDonationInvoices,
    getDonationInvoiceByPk,
    createDonationInvoice,
    updateDonationInvoice,
    deleteDonationInvoice
};
