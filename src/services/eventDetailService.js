const cloudinary = require('../config/cloudinary');
const eventDetailRepository = require('../repositories/eventDetailRepository');
const dogEventRepository = require('../repositories/dogEventRepository');
const dogEventService = require('./dogEventService');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const EVENT_DETAIL_LIST_CACHE_KEY = 'event-detail:list';
const EVENT_DETAIL_BY_EVENT_PREFIX = 'event-detail:event:';
const EVENT_DETAIL_DETAIL_PREFIX = 'event-detail:detail:';
const EVENT_DETAIL_CACHE_TTL_MS = Number(process.env.EVENT_DETAIL_CACHE_TTL_MS || 15000);
const eventDetailQueryCache = new MemoryCache({
    defaultTtlMs: EVENT_DETAIL_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getEventDetailsByEventCacheKey(idEvento) {
    return `${EVENT_DETAIL_BY_EVENT_PREFIX}${String(idEvento).trim()}`;
}

function getEventDetailCacheKey(idDetalleEvento) {
    return `${EVENT_DETAIL_DETAIL_PREFIX}${String(idDetalleEvento).trim()}`;
}

function invalidateEventDetailCache({
    idDetalleEvento = null,
    eventIds = []
} = {}) {
    eventDetailQueryCache.delete(EVENT_DETAIL_LIST_CACHE_KEY);

    if (idDetalleEvento !== undefined && idDetalleEvento !== null) {
        eventDetailQueryCache.delete(getEventDetailCacheKey(idDetalleEvento));
    }

    if (Array.isArray(eventIds) && eventIds.length > 0) {
        for (const idEvento of eventIds) {
            if (idEvento !== undefined && idEvento !== null) {
                eventDetailQueryCache.delete(getEventDetailsByEventCacheKey(idEvento));
            }
        }
        return;
    }

    eventDetailQueryCache.clearByPrefix(EVENT_DETAIL_BY_EVENT_PREFIX);
}

function normalizeRequiredText(value, fieldLabel) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        throw createHttpError(`${fieldLabel} is required`, 400);
    }

    return normalizedValue;
}

function sanitizeFileName(fileName) {
    return String(fileName || 'receipt')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'receipt';
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

function ensureUploadFileExists(file) {
    if (!file?.buffer) {
        throw createHttpError('Receipt image file is required', 400);
    }
}

async function uploadReceiptImageToCloudinary(file, idEvento) {
    ensureCloudinaryConfiguration();

    const folder = process.env.CLOUDINARY_EVENT_DETAIL_FOLDER || 'kalo/event-detail-receipts';
    const publicId = `event-detail-${idEvento}-${Date.now()}-${sanitizeFileName(file.originalname)}`;

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

function parsePositiveInteger(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isInteger(parsedValue) || parsedValue < 1) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedValue;
}

function parseAmount(value, fieldLabel) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue) || parsedValue < 0) {
        throw createHttpError(`${fieldLabel} must be zero or greater`, 400);
    }

    return parsedValue;
}

function formatEventDetail(eventDetail, eventContext = null) {
    return {
        idDetalleEvento: Number(eventDetail.ID_DETALLE_EVENTO),
        idEvento: Number(eventDetail.ID_EVENTO),
        idPerrito:
            eventDetail.ID_PERRITO === null || eventDetail.ID_PERRITO === undefined
                ? eventContext?.idPerrito ?? null
                : Number(eventDetail.ID_PERRITO),
        nombrePerrito: eventDetail.NOMBRE_PERRITO || eventContext?.nombrePerrito || null,
        comprobanteUrl: eventDetail.COMPROBANTE_URL || null,
        descripcion: eventDetail.DESCRIPCION || null,
        monto:
            eventDetail.MONTO === null || eventDetail.MONTO === undefined
                ? null
                : Number(eventDetail.MONTO),
        idEstado: Number(eventDetail.ID_ESTADO),
        estado: eventDetail.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureEventExists(idEvento) {
    const dogEvent = await dogEventRepository.findDogEventById(idEvento);

    if (!dogEvent) {
        throw createHttpError('Dog event not found', 404);
    }

    return {
        idEvento: Number(dogEvent.ID_EVENTO),
        idPerrito: Number(dogEvent.ID_PERRITO),
        nombrePerrito: dogEvent.NOMBRE_PERRITO || null,
        idEstado: Number(dogEvent.ID_ESTADO)
    };
}

function ensureActiveDetailCanBelongToEvent(eventInfo, nextState) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(eventInfo.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep an event detail active under an inactive dog event',
            409
        );
    }
}

function normalizeCreatePayload(eventDetailData) {
    return {
        idEvento: parsePositiveInteger(eventDetailData.idEvento, 'Dog event'),
        descripcion: normalizeRequiredText(eventDetailData.descripcion, 'Description'),
        monto: parseAmount(eventDetailData.monto, 'Amount'),
        idEstado: parsePositiveInteger(eventDetailData.idEstado, 'State')
    };
}

function normalizeUpdatePayload(eventDetailData) {
    return {
        idEvento: parsePositiveInteger(eventDetailData.idEvento, 'Dog event'),
        descripcion: normalizeRequiredText(eventDetailData.descripcion, 'Description'),
        monto: parseAmount(eventDetailData.monto, 'Amount'),
        idEstado: parsePositiveInteger(eventDetailData.idEstado, 'State')
    };
}

function invalidateRelatedCaches({ idDetalleEvento = null, eventIds = [] } = {}) {
    invalidateEventDetailCache({ idDetalleEvento, eventIds });

    for (const idEvento of eventIds) {
        if (idEvento !== undefined && idEvento !== null) {
            dogEventService.invalidateDogEventReadCaches(idEvento);
        }
    }
}

async function getEventDetails() {
    return eventDetailQueryCache.getOrSet(EVENT_DETAIL_LIST_CACHE_KEY, async () => {
        const eventDetails = await eventDetailRepository.findAllEventDetails();
        return eventDetails.map((eventDetail) => formatEventDetail(eventDetail));
    });
}

async function getEventDetailsByEvent(idEvento) {
    return eventDetailQueryCache.getOrSet(
        getEventDetailsByEventCacheKey(idEvento),
        async () => {
            const eventInfo = await ensureEventExists(idEvento);
            const eventDetails = await eventDetailRepository.findEventDetailsByEvent(idEvento);

            return eventDetails.map((eventDetail) =>
                formatEventDetail(eventDetail, eventInfo)
            );
        }
    );
}

async function getEventDetailById(idDetalleEvento) {
    return eventDetailQueryCache.getOrSet(
        getEventDetailCacheKey(idDetalleEvento),
        async () => {
            const eventDetail = await eventDetailRepository.findEventDetailById(
                idDetalleEvento
            );

            if (!eventDetail) {
                throw createHttpError('Event detail not found', 404);
            }

            const eventInfo = await ensureEventExists(eventDetail.ID_EVENTO);
            return formatEventDetail(eventDetail, eventInfo);
        }
    );
}

async function createEventDetail(eventDetailData, file) {
    const requestedState =
        eventDetailData.idEstado === undefined ||
        eventDetailData.idEstado === null ||
        eventDetailData.idEstado === ''
            ? 1
            : Number(eventDetailData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New event details must start in active state', 400);
    }

    const payload = normalizeCreatePayload({
        ...eventDetailData,
        idEstado: requestedState
    });

    ensureUploadFileExists(file);
    await ensureStateExists(payload.idEstado);
    const eventInfo = await ensureEventExists(payload.idEvento);
    ensureActiveDetailCanBelongToEvent(eventInfo, payload.idEstado);

    const uploadedReceipt = await uploadReceiptImageToCloudinary(file, payload.idEvento);

    try {
        const result = await eventDetailRepository.createEventDetail({
            ...payload,
            comprobanteUrl: uploadedReceipt.secure_url
        });
        invalidateRelatedCaches({
            idDetalleEvento: result.idDetalleEvento,
            eventIds: [payload.idEvento]
        });

        return getEventDetailById(result.idDetalleEvento);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedReceipt.public_id);
        throw error;
    }
}

async function updateEventDetail(idDetalleEvento, eventDetailData, file) {
    const normalizedIdDetalleEvento = Number(idDetalleEvento);
    const existingEventDetail = await getEventDetailById(normalizedIdDetalleEvento);
    const payload = normalizeUpdatePayload(eventDetailData);

    await ensureStateExists(payload.idEstado);
    const eventInfo = await ensureEventExists(payload.idEvento);
    ensureActiveDetailCanBelongToEvent(eventInfo, payload.idEstado);

    let uploadedReceipt = null;
    let nextComprobanteUrl = existingEventDetail.comprobanteUrl;

    if (file?.buffer) {
        uploadedReceipt = await uploadReceiptImageToCloudinary(file, payload.idEvento);
        nextComprobanteUrl = uploadedReceipt.secure_url;
    }

    try {
        await eventDetailRepository.updateEventDetail({
            idDetalleEvento: normalizedIdDetalleEvento,
            ...payload,
            comprobanteUrl: nextComprobanteUrl
        });
        invalidateRelatedCaches({
            idDetalleEvento: normalizedIdDetalleEvento,
            eventIds: Array.from(new Set([existingEventDetail.idEvento, payload.idEvento]))
        });

        return getEventDetailById(normalizedIdDetalleEvento);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedReceipt?.public_id);
        throw error;
    }
}

async function deleteEventDetail(idDetalleEvento) {
    const normalizedIdDetalleEvento = Number(idDetalleEvento);
    const existingEventDetail = await getEventDetailById(normalizedIdDetalleEvento);

    if (Number(existingEventDetail.idEstado) !== 1) {
        throw createHttpError('Event detail is already inactive', 409);
    }

    await eventDetailRepository.deleteEventDetail(normalizedIdDetalleEvento);
    invalidateRelatedCaches({
        idDetalleEvento: normalizedIdDetalleEvento,
        eventIds: [existingEventDetail.idEvento]
    });
}

module.exports = {
    getEventDetails,
    getEventDetailsByEvent,
    getEventDetailById,
    createEventDetail,
    updateEventDetail,
    deleteEventDetail
};
