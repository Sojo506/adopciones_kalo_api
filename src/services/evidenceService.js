const cloudinary = require('../config/cloudinary');
const userRepository = require('../repositories/userRepository');
const evidenceRepository = require('../repositories/evidenceRepository');
const followUpService = require('./followUpService');
const catalogService = require('./catalogService');
const MemoryCache = require('../utils/memoryCache');

const EVIDENCE_LIST_ADMIN_CACHE_KEY = 'evidence:list:admin';
const EVIDENCE_LIST_ACCOUNT_CACHE_PREFIX = 'evidence:list:account:';
const EVIDENCE_DETAIL_CACHE_PREFIX = 'evidence:detail:';
const EVIDENCE_FOLLOW_UP_CACHE_PREFIX = 'evidence:follow-up:';
const EVIDENCE_CACHE_TTL_MS = Number(process.env.EVIDENCE_CACHE_TTL_MS || 15000);
const evidenceQueryCache = new MemoryCache({
    defaultTtlMs: EVIDENCE_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getAccountListCacheKey(idCuenta) {
    return `${EVIDENCE_LIST_ACCOUNT_CACHE_PREFIX}${String(idCuenta).trim()}`;
}

function getEvidenceDetailCacheKey(idEvidencia) {
    return `${EVIDENCE_DETAIL_CACHE_PREFIX}${String(idEvidencia).trim()}`;
}

function getFollowUpEvidenceCacheKey(idSeguimiento) {
    return `${EVIDENCE_FOLLOW_UP_CACHE_PREFIX}${String(idSeguimiento).trim()}`;
}

function invalidateEvidenceCache(idEvidencia = null, followUpIds = []) {
    evidenceQueryCache.delete(EVIDENCE_LIST_ADMIN_CACHE_KEY);
    evidenceQueryCache.clearByPrefix(EVIDENCE_LIST_ACCOUNT_CACHE_PREFIX);

    if (idEvidencia !== undefined && idEvidencia !== null) {
        evidenceQueryCache.delete(getEvidenceDetailCacheKey(idEvidencia));
    } else {
        evidenceQueryCache.clearByPrefix(EVIDENCE_DETAIL_CACHE_PREFIX);
    }

    const normalizedFollowUpIds = Array.from(
        new Set(
            followUpIds
                .filter((value) => value !== undefined && value !== null && value !== '')
                .map((value) => Number(value))
                .filter((value) => !Number.isNaN(value))
        )
    );

    if (normalizedFollowUpIds.length > 0) {
        normalizedFollowUpIds.forEach((idSeguimiento) => {
            evidenceQueryCache.delete(getFollowUpEvidenceCacheKey(idSeguimiento));
            followUpService.invalidateFollowUpReadCaches?.(idSeguimiento);
        });
        return;
    }

    evidenceQueryCache.clearByPrefix(EVIDENCE_FOLLOW_UP_CACHE_PREFIX);
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

function toComparableDate(value, fieldLabel) {
    const serializedDate = serializeDateOnly(value);

    if (!serializedDate) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return new Date(`${serializedDate}T00:00:00.000Z`);
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue || null;
}

function sanitizeFileName(fileName) {
    return String(fileName || 'evidence')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'evidence';
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

function parseBooleanLike(value) {
    if (typeof value === 'boolean') {
        return value;
    }

    const normalizedValue = String(value || '').trim().toLowerCase();
    return ['1', 'true', 'yes', 'on'].includes(normalizedValue);
}

function isAdminAccount(account) {
    return Number(account?.ID_TIPO_USUARIO) === 1;
}

function pickFirstDefined(...values) {
    return values.find((value) => value !== undefined && value !== null);
}

function formatEvidence(evidence, followUp = null) {
    const sourceFollowUp = followUp || evidence;
    const rawIdAdopcion = pickFirstDefined(sourceFollowUp?.idAdopcion, sourceFollowUp?.ID_ADOPCION);
    const rawIdentificacion = pickFirstDefined(
        sourceFollowUp?.identificacion,
        sourceFollowUp?.IDENTIFICACION
    );
    const rawIdPerrito = pickFirstDefined(sourceFollowUp?.idPerrito, sourceFollowUp?.ID_PERRITO);
    const rawIdTipoSeguimiento = pickFirstDefined(
        sourceFollowUp?.idTipoSeguimiento,
        sourceFollowUp?.ID_TIPO_SEGUIMIENTO
    );
    const fechaInicioSeguimiento = pickFirstDefined(
        sourceFollowUp?.fechaInicio,
        serializeDateOnly(sourceFollowUp?.FECHA_INICIO)
    );
    const fechaFinSeguimiento = pickFirstDefined(
        sourceFollowUp?.fechaFin,
        serializeDateOnly(sourceFollowUp?.FECHA_FIN)
    );

    return {
        idEvidencia: Number(evidence.ID_EVIDENCIA),
        idSeguimiento: Number(evidence.ID_SEGUIMIENTO),
        idAdopcion: rawIdAdopcion === undefined || rawIdAdopcion === null ? null : Number(rawIdAdopcion),
        identificacion: rawIdentificacion ? String(rawIdentificacion) : null,
        adoptante: pickFirstDefined(sourceFollowUp?.adoptante, sourceFollowUp?.ADOPTANTE) || null,
        idPerrito: rawIdPerrito === undefined || rawIdPerrito === null ? null : Number(rawIdPerrito),
        nombrePerrito:
            pickFirstDefined(sourceFollowUp?.nombrePerrito, sourceFollowUp?.NOMBRE_PERRITO) || null,
        idTipoSeguimiento:
            rawIdTipoSeguimiento === undefined || rawIdTipoSeguimiento === null
                ? null
                : Number(rawIdTipoSeguimiento),
        tipoSeguimiento:
            pickFirstDefined(sourceFollowUp?.tipoSeguimiento, sourceFollowUp?.TIPO_SEGUIMIENTO) || null,
        fechaInicioSeguimiento: fechaInicioSeguimiento || null,
        fechaFinSeguimiento: fechaFinSeguimiento || null,
        imageUrl: evidence.IMAGEN_URL || null,
        comentarios: evidence.COMENTARIOS || '',
        fechaEvidencia: serializeDateOnly(evidence.FECHA_EVIDENCIA),
        idEstado: Number(evidence.ID_ESTADO),
        estado: evidence.ESTADO || null
    };
}

async function loadActorAccount(idCuenta) {
    const account = await userRepository.findAccountByIdCuenta(idCuenta);

    if (!account) {
        throw createHttpError('Authenticated account not found', 401);
    }

    return account;
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

function ensureActorCanAccessFollowUp(actorAccount, followUp) {
    if (isAdminAccount(actorAccount)) {
        return;
    }

    if (String(actorAccount.IDENTIFICACION) !== String(followUp.identificacion)) {
        throw createHttpError('You do not have access to this follow-up', 403);
    }
}

async function getAccessibleFollowUp(idSeguimiento, actorAccount) {
    const followUp = await followUpService.getFollowUpById(idSeguimiento);
    ensureActorCanAccessFollowUp(actorAccount, followUp);
    return followUp;
}

function ensureEvidenceCanRemainActive({ followUp, nextState }) {
    if (Number(nextState) !== 1) {
        return;
    }

    if (Number(followUp.idEstado) !== 1) {
        throw createHttpError(
            'Cannot keep an evidence active under an inactive follow-up',
            409
        );
    }
}

function ensureEvidenceDateFitsFollowUp(followUp, fechaEvidencia) {
    const evidenceDate = toComparableDate(fechaEvidencia, 'Evidence date');
    const followUpStartDate = toComparableDate(
        followUp.fechaInicio,
        'Follow-up start date'
    );
    const followUpEndDate = toComparableDate(
        followUp.fechaFin,
        'Follow-up end date'
    );

    if (evidenceDate.getTime() < followUpStartDate.getTime()) {
        throw createHttpError(
            'Evidence date cannot be earlier than the follow-up start date',
            409
        );
    }

    if (evidenceDate.getTime() > followUpEndDate.getTime()) {
        throw createHttpError(
            'Evidence date cannot be later than the follow-up end date',
            409
        );
    }
}

function ensureEvidenceHasContent({ imageUrl, comentarios }) {
    if (!imageUrl && !comentarios) {
        throw createHttpError(
            'An evidence must include an image or comments',
            400
        );
    }
}

async function uploadImageToCloudinary(file, idSeguimiento) {
    ensureCloudinaryConfiguration();

    const folder = process.env.CLOUDINARY_EVIDENCE_IMAGES_FOLDER || 'kalo/evidence-images';
    const publicId = `follow-up-${idSeguimiento}-${Date.now()}-${sanitizeFileName(file.originalname)}`;

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

async function getEvidenceById(idEvidencia, idCuenta) {
    const actorAccount = await loadActorAccount(idCuenta);
    const evidence = await evidenceQueryCache.getOrSet(
        getEvidenceDetailCacheKey(idEvidencia),
        async () => {
            const rawEvidence = await evidenceRepository.findEvidenceById(idEvidencia);

            if (!rawEvidence) {
                throw createHttpError('Evidence not found', 404);
            }

            const followUp = await followUpService.getFollowUpById(rawEvidence.ID_SEGUIMIENTO);
            return formatEvidence(rawEvidence, followUp);
        }
    );

    ensureActorCanAccessFollowUp(actorAccount, evidence);
    return evidence;
}

async function getEvidences(idCuenta) {
    const actorAccount = await loadActorAccount(idCuenta);

    if (isAdminAccount(actorAccount)) {
        return evidenceQueryCache.getOrSet(EVIDENCE_LIST_ADMIN_CACHE_KEY, async () => {
            const [evidences, followUps] = await Promise.all([
                evidenceRepository.findAllEvidences(),
                followUpService.getFollowUps()
            ]);
            const followUpById = new Map(
                followUps.map((followUp) => [Number(followUp.idSeguimiento), followUp])
            );

            return evidences.map((evidence) =>
                formatEvidence(
                    evidence,
                    followUpById.get(Number(evidence.ID_SEGUIMIENTO)) || null
                )
            );
        });
    }

    return evidenceQueryCache.getOrSet(
        getAccountListCacheKey(actorAccount.ID_CUENTA),
        async () => {
            const evidences = await evidenceRepository.findEvidencesByAccountId(
                actorAccount.ID_CUENTA
            );
            return evidences.map((evidence) => formatEvidence(evidence));
        }
    );
}

async function getEvidencesByFollowUp(idSeguimiento, idCuenta) {
    const actorAccount = await loadActorAccount(idCuenta);
    const followUp = await getAccessibleFollowUp(idSeguimiento, actorAccount);

    return evidenceQueryCache.getOrSet(
        getFollowUpEvidenceCacheKey(idSeguimiento),
        async () => {
            const evidences = await evidenceRepository.findEvidencesByFollowUpId(idSeguimiento);
            return evidences.map((evidence) => formatEvidence(evidence, followUp));
        }
    );
}

async function createEvidence(evidenceData, file, idCuenta) {
    const actorAccount = await loadActorAccount(idCuenta);
    const requestedState =
        evidenceData.idEstado === undefined ||
        evidenceData.idEstado === null ||
        evidenceData.idEstado === ''
            ? 1
            : Number(evidenceData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New evidences must start in active state', 400);
    }

    const payload = {
        idSeguimiento: Number(evidenceData.idSeguimiento),
        comentarios: normalizeOptionalText(evidenceData.comentarios),
        fechaEvidencia: parseDateValue(evidenceData.fechaEvidencia, 'Evidence date'),
        idEstado: requestedState
    };

    await ensureStateExists(payload.idEstado);
    const followUp = await getAccessibleFollowUp(payload.idSeguimiento, actorAccount);
    ensureEvidenceCanRemainActive({
        followUp,
        nextState: payload.idEstado
    });
    ensureEvidenceDateFitsFollowUp(followUp, payload.fechaEvidencia);

    const imageUrlFromBody = normalizeOptionalText(evidenceData.imageUrl);
    let uploadedImage = null;
    let imageUrl = imageUrlFromBody;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.idSeguimiento);
        imageUrl = uploadedImage.secure_url;
    }

    ensureEvidenceHasContent({
        imageUrl,
        comentarios: payload.comentarios
    });

    try {
        const result = await evidenceRepository.createEvidence({
            ...payload,
            imageUrl
        });

        invalidateEvidenceCache(result.idEvidencia, [payload.idSeguimiento]);
        return getEvidenceById(result.idEvidencia, idCuenta);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
}

async function updateEvidence(idEvidencia, evidenceData, file, idCuenta) {
    const actorAccount = await loadActorAccount(idCuenta);
    const existingEvidence = await getEvidenceById(idEvidencia, idCuenta);
    const payload = {
        idEvidencia: Number(idEvidencia),
        idSeguimiento: Number(evidenceData.idSeguimiento),
        comentarios: normalizeOptionalText(evidenceData.comentarios),
        fechaEvidencia: parseDateValue(evidenceData.fechaEvidencia, 'Evidence date'),
        idEstado: Number(evidenceData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const followUp = await getAccessibleFollowUp(payload.idSeguimiento, actorAccount);
    ensureEvidenceCanRemainActive({
        followUp,
        nextState: payload.idEstado
    });
    ensureEvidenceDateFitsFollowUp(followUp, payload.fechaEvidencia);

    const hasImageUrlField = Object.prototype.hasOwnProperty.call(
        evidenceData,
        'imageUrl'
    );
    const nextManualImageUrl = normalizeOptionalText(evidenceData.imageUrl);
    const shouldClearImage = parseBooleanLike(evidenceData.clearImage);

    let uploadedImage = null;
    let nextImageUrl = existingEvidence.imageUrl;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.idSeguimiento);
        nextImageUrl = uploadedImage.secure_url;
    } else if (hasImageUrlField) {
        nextImageUrl = nextManualImageUrl;
    } else if (shouldClearImage) {
        nextImageUrl = null;
    }

    ensureEvidenceHasContent({
        imageUrl: nextImageUrl,
        comentarios: payload.comentarios
    });

    try {
        await evidenceRepository.updateEvidence({
            ...payload,
            imageUrl: nextImageUrl
        });

        invalidateEvidenceCache(payload.idEvidencia, [
            existingEvidence.idSeguimiento,
            payload.idSeguimiento
        ]);

        return getEvidenceById(payload.idEvidencia, idCuenta);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
}

async function deleteEvidence(idEvidencia, idCuenta) {
    const existingEvidence = await getEvidenceById(idEvidencia, idCuenta);

    if (Number(existingEvidence.idEstado) !== 1) {
        throw createHttpError('Evidence is already inactive', 409);
    }

    await evidenceRepository.deleteEvidence(idEvidencia);
    invalidateEvidenceCache(idEvidencia, [existingEvidence.idSeguimiento]);
}

module.exports = {
    getEvidences,
    getEvidencesByFollowUp,
    getEvidenceById,
    createEvidence,
    updateEvidence,
    deleteEvidence,
    invalidateEvidenceReadCaches: invalidateEvidenceCache
};
