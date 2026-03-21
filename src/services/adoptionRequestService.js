const catalogService = require('./catalogService');
const dogService = require('./dogService');
const adoptionRequestRepository = require('../repositories/adoptionRequestRepository');
const requestQuestionService = require('./requestQuestionService');
const { createAdoption } = require('./adoptionService');

const ACTIVE_STATE_ID = 1;
const PENDING_STATE_ID = 3;
const ADOPTION_REQUEST_TYPE_NAME = 'Adopcion';

const CLOSED_REQUEST_STATES = new Set([
    'inactivo',
    'rechazado',
    'cancelado',
    'archivado',
    'completado',
    'finalizado'
]);

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
}

function normalizeIdentification(value) {
    return String(value || '').trim();
}

function normalizeBooleanAnswer(value) {
    if (typeof value === 'boolean') {
        return value ? 'Si' : 'No';
    }

    const normalizedValue = normalizeText(value);

    if (['si', 'yes', 'true', '1'].includes(normalizedValue)) {
        return 'Si';
    }

    if (['no', 'false', '0'].includes(normalizedValue)) {
        return 'No';
    }

    throw createHttpError('A yes/no question received an invalid answer', 400);
}

function normalizeNumericAnswer(value) {
    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
        throw createHttpError('A numeric question received an invalid answer', 400);
    }

    return String(parsedValue);
}

function normalizeFreeTextAnswer(value) {
    const normalizedValue = String(value || '').trim();

    if (!normalizedValue) {
        throw createHttpError('A question is missing an answer', 400);
    }

    if (normalizedValue.length > 500) {
        throw createHttpError('An answer exceeds the maximum allowed length', 400);
    }

    return normalizedValue;
}

function normalizeAnswerByQuestion(question, rawAnswer) {
    const normalizedResponseType = normalizeText(question.tipoRespuesta);

    if (normalizedResponseType === 'si / no') {
        return normalizeBooleanAnswer(rawAnswer);
    }

    if (normalizedResponseType === 'numerico') {
        return normalizeNumericAnswer(rawAnswer);
    }

    return normalizeFreeTextAnswer(rawAnswer);
}

function isRequestClosed(stateName) {
    return CLOSED_REQUEST_STATES.has(normalizeText(stateName));
}

async function getAdoptionRequestTypeId() {
    const requestTypes = await catalogService.getRequestTypes();

    const matchingType = requestTypes.find(
        (requestType) =>
            normalizeText(requestType.nombre) === normalizeText(ADOPTION_REQUEST_TYPE_NAME)
    );

    if (matchingType) {
        return Number(matchingType.idTipoSolicitud);
    }

    const fallbackType = requestTypes.find(
        (requestType) => Number(requestType.idTipoSolicitud) === 1
    );

    if (fallbackType) {
        return Number(fallbackType.idTipoSolicitud);
    }

    throw createHttpError('Adoption request type is not configured', 500);
}

async function ensureApplicantIsEligible(identificacion) {
    const eligibility = await adoptionRequestRepository.findApplicantEligibility(identificacion);

    if (!eligibility) {
        return;
    }

    if (normalizeText(eligibility.ES_ELEGIBLE) !== 'si') {
        throw createHttpError(
            'Your profile is not currently eligible to submit a new adoption request',
            409
        );
    }
}

async function ensureResponsesAreValid(respuestas, idTipoSolicitud) {
    const questions = await requestQuestionService.getActiveQuestionsByRequestType(
        idTipoSolicitud
    );

    if (questions.length === 0) {
        throw createHttpError(
            'The selected request type does not have active questions configured',
            409
        );
    }

    const questionsById = new Map(
        questions.map((question) => [Number(question.idPregunta), question])
    );

    const answeredQuestions = new Set();
    const normalizedResponses = [];

    for (const respuesta of respuestas) {
        const idPregunta = Number(respuesta.idPregunta);
        const question = questionsById.get(idPregunta);

        if (!question) {
            throw createHttpError('A submitted question does not exist or is not active', 400);
        }

        if (answeredQuestions.has(idPregunta)) {
            throw createHttpError('Each question can only be answered once', 400);
        }

        answeredQuestions.add(idPregunta);

        normalizedResponses.push({
            idPregunta,
            respuesta: normalizeAnswerByQuestion(question, respuesta.respuesta)
        });
    }

    if (answeredQuestions.size !== questionsById.size) {
        throw createHttpError('All active questions for this form must be answered', 400);
    }

    return normalizedResponses;
}

async function ensureNoOpenRequestForDog(identificacion, idPerrito) {
    const normalizedIdentification = normalizeIdentification(identificacion);
    const requests = await adoptionRequestRepository.findAllRequests();

    const duplicatedRequest = requests.find(
        (request) =>
            normalizeIdentification(request.IDENTIFICACION) === normalizedIdentification &&
            Number(request.ID_PERRITO) === Number(idPerrito) &&
            !isRequestClosed(request.ESTADO_SOLICITUD)
    );

    if (duplicatedRequest) {
        throw createHttpError(
            'You already have an active adoption request for this dog',
            409
        );
    }
}

async function createAdoptionRequest({ identificacion, idPerrito, respuestas }) {
    const normalizedIdentification = normalizeIdentification(identificacion);

    const [dog, idTipoSolicitud] = await Promise.all([
        dogService.getDogById(idPerrito),
        getAdoptionRequestTypeId()
    ]);

    const normalizedResponses = await ensureResponsesAreValid(
        respuestas,
        idTipoSolicitud
    );

    await ensureApplicantIsEligible(normalizedIdentification);
    await ensureNoOpenRequestForDog(normalizedIdentification, dog.idPerrito);

    const createdRequest = await adoptionRequestRepository.createRequest({
        identificacion: normalizedIdentification,
        idTipoSolicitud,
        idEstado: ACTIVE_STATE_ID
    });

    for (const response of normalizedResponses) {
        await adoptionRequestRepository.createResponse({
            idSolicitud: createdRequest.idSolicitud,
            idPregunta: response.idPregunta,
            respuesta: response.respuesta,
            idEstado: ACTIVE_STATE_ID
        });
    }

    const createdAdoption = await createAdoption({
        identificacion: normalizedIdentification,
        idPerrito: dog.idPerrito,
        idSolicitud: createdRequest.idSolicitud,
        idEstado: PENDING_STATE_ID
    });

    return {
        idSolicitud: createdRequest.idSolicitud,
        idPerrito: dog.idPerrito,
        nombrePerrito: dog.nombre,
        idTipoSolicitud,
        totalRespuestas: normalizedResponses.length,
        solicitud: {
            idEstado: ACTIVE_STATE_ID
        },
        adopcion: {
            idAdopcion: createdAdoption.idAdopcion,
            idEstado: createdAdoption.idEstado,
            estado: createdAdoption.estado,
            fechaAdopcion: createdAdoption.fechaAdopcion
        }
    };
}

module.exports = {
    createAdoptionRequest
};