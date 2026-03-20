const catalogService = require('./catalogService');
const invoiceService = require('./invoiceService');
const paypalPaymentRepository = require('../repositories/paypalPaymentRepository');
const MemoryCache = require('../utils/memoryCache');

const PAYPAL_PAYMENT_LIST_CACHE_KEY = 'paypal-payment:list';
const PAYPAL_PAYMENT_DETAIL_CACHE_PREFIX = 'paypal-payment:detail:';
const PAYPAL_PAYMENT_CACHE_TTL_MS = Number(process.env.PAYPAL_PAYMENT_CACHE_TTL_MS || 15000);
const paypalPaymentQueryCache = new MemoryCache({
    defaultTtlMs: PAYPAL_PAYMENT_CACHE_TTL_MS
});

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function getPayPalPaymentDetailCacheKey(idPago) {
    return `${PAYPAL_PAYMENT_DETAIL_CACHE_PREFIX}${String(idPago).trim()}`;
}

function invalidatePayPalPaymentCache(idPago) {
    paypalPaymentQueryCache.delete(PAYPAL_PAYMENT_LIST_CACHE_KEY);

    if (idPago !== undefined && idPago !== null) {
        paypalPaymentQueryCache.delete(getPayPalPaymentDetailCacheKey(idPago));
        return;
    }

    paypalPaymentQueryCache.clearByPrefix(PAYPAL_PAYMENT_DETAIL_CACHE_PREFIX);
}

function invalidateRelatedCaches(idPago, idFactura = null) {
    invalidatePayPalPaymentCache(idPago);
    if (idFactura !== undefined && idFactura !== null) {
        invoiceService.invalidateInvoiceQueryCaches(idFactura);
    }
}

function normalizeOptionalText(value) {
    const normalizedValue = String(value || '').trim();
    return normalizedValue ? normalizedValue : null;
}

function parseDateValue(value, fieldLabel, { required = false } = {}) {
    if (value === undefined || value === null || value === '') {
        if (required) {
            throw createHttpError(`${fieldLabel} is required`, 400);
        }

        return null;
    }

    const parsedDate = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        throw createHttpError(`${fieldLabel} is invalid`, 400);
    }

    return parsedDate;
}

function formatPayPalPayment(paypalPayment) {
    return {
        idPago: Number(paypalPayment.ID_PAGO),
        idFactura: paypalPayment.ID_FACTURA,
        paypalOrderId: paypalPayment.PAYPAL_ORDER_ID || null,
        paypalCaptureId: paypalPayment.PAYPAL_CAPTURE_ID || null,
        fechaPago: paypalPayment.FECHA_PAGO || null,
        idEstado: Number(paypalPayment.ID_ESTADO),
        estado: paypalPayment.ESTADO || null
    };
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureInvoiceExists(idFactura) {
    return invoiceService.getInvoiceById(idFactura);
}

function ensureActivePaymentCanUseInvoice(invoice, paymentState) {
    if (Number(paymentState) !== 1) {
        return;
    }

    if (Number(invoice.idEstado) !== 1) {
        throw createHttpError('Cannot keep a PayPal payment active for an inactive invoice', 409);
    }
}

function normalizePayPalPaymentPayload(paypalPaymentData) {
    return {
        idFactura: String(paypalPaymentData.idFactura || '').trim(),
        paypalOrderId: normalizeOptionalText(paypalPaymentData.paypalOrderId),
        paypalCaptureId: normalizeOptionalText(paypalPaymentData.paypalCaptureId),
        fechaPago: parseDateValue(paypalPaymentData.fechaPago, 'Payment date', { required: true }),
        idEstado: Number(paypalPaymentData.idEstado)
    };
}

async function getPayPalPayments() {
    return paypalPaymentQueryCache.getOrSet(PAYPAL_PAYMENT_LIST_CACHE_KEY, async () => {
        const paypalPayments = await paypalPaymentRepository.findAllPayPalPayments();
        return paypalPayments.map((paypalPayment) => formatPayPalPayment(paypalPayment));
    });
}

async function getPayPalPaymentById(idPago) {
    return paypalPaymentQueryCache.getOrSet(getPayPalPaymentDetailCacheKey(idPago), async () => {
        const paypalPayment = await paypalPaymentRepository.findPayPalPaymentById(idPago);

        if (!paypalPayment) {
            throw createHttpError('PayPal payment not found', 404);
        }

        return formatPayPalPayment(paypalPayment);
    });
}

async function createPayPalPayment(paypalPaymentData) {
    const requestedState =
        paypalPaymentData.idEstado === undefined ||
        paypalPaymentData.idEstado === null ||
        paypalPaymentData.idEstado === ''
            ? 1
            : Number(paypalPaymentData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New PayPal payments must start in active state', 400);
    }

    const payload = {
        ...normalizePayPalPaymentPayload({
            ...paypalPaymentData,
            idEstado: requestedState
        }),
        idEstado: requestedState
    };

    if (!payload.idFactura) {
        throw createHttpError('Invoice ID is required', 400);
    }

    await ensureStateExists(payload.idEstado);
    const invoice = await ensureInvoiceExists(payload.idFactura);
    ensureActivePaymentCanUseInvoice(invoice, payload.idEstado);

    const result = await paypalPaymentRepository.createPayPalPayment(payload);
    invalidateRelatedCaches(result.idPago, payload.idFactura);

    return getPayPalPaymentById(result.idPago);
}

async function updatePayPalPayment(idPago, paypalPaymentData) {
    const normalizedIdPago = Number(idPago);
    const existingPayPalPayment = await getPayPalPaymentById(normalizedIdPago);
    const payload = normalizePayPalPaymentPayload(paypalPaymentData);

    if (!payload.idFactura) {
        throw createHttpError('Invoice ID is required', 400);
    }

    await ensureStateExists(payload.idEstado);
    const invoice = await ensureInvoiceExists(payload.idFactura);
    ensureActivePaymentCanUseInvoice(invoice, payload.idEstado);

    await paypalPaymentRepository.updatePayPalPayment({
        idPago: normalizedIdPago,
        ...payload
    });

    invalidateRelatedCaches(normalizedIdPago, existingPayPalPayment.idFactura);
    if (existingPayPalPayment.idFactura !== payload.idFactura) {
        invoiceService.invalidateInvoiceQueryCaches(payload.idFactura);
    }

    return getPayPalPaymentById(normalizedIdPago);
}

async function deletePayPalPayment(idPago) {
    const normalizedIdPago = Number(idPago);
    const existingPayPalPayment = await getPayPalPaymentById(normalizedIdPago);

    await paypalPaymentRepository.deletePayPalPayment(normalizedIdPago);
    invalidateRelatedCaches(normalizedIdPago, existingPayPalPayment.idFactura);
}

module.exports = {
    getPayPalPayments,
    getPayPalPaymentById,
    createPayPalPayment,
    updatePayPalPayment,
    deletePayPalPayment
};
