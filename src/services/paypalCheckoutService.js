const { PAYPAL_BASE_URL, getAccessToken } = require('../config/paypal');
const currencyRepository = require('../repositories/currencyRepository');
const donationInvoiceRepository = require('../repositories/donationInvoiceRepository');
const paypalPaymentRepository = require('../repositories/paypalPaymentRepository');
const donationService = require('./donationService');
const invoiceService = require('./invoiceService');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

// Resolves the DB currency ID to use for PayPal invoices.
// Priority: PAYPAL_CURRENCY_ID env var → USD by name/symbol → first active currency.
async function getInvoiceCurrencyId() {
    const envId = Number(process.env.PAYPAL_CURRENCY_ID);

    if (Number.isFinite(envId) && envId > 0) {
        return envId;
    }

    const currencies = await currencyRepository.findAllCurrenciesForAdmin();

    const usd = currencies.find((c) => {
        const name = String(c.NOMBRE || '').toUpperCase();
        const symbol = String(c.SIMBOLO || '').trim();
        return (
            name === 'USD' ||
            name.includes('DOLAR') ||
            name.includes('DOLLAR') ||
            symbol === '$' ||
            symbol === 'USD'
        );
    });

    if (usd) {
        return Number(usd.ID_MONEDA);
    }

    const active = currencies.find((c) => Number(c.ID_ESTADO) === 1);

    if (active) {
        return Number(active.ID_MONEDA);
    }

    throw createHttpError(
        'No hay una moneda configurada para pagos de PayPal. Defina PAYPAL_CURRENCY_ID en las variables de entorno.',
        500
    );
}

async function createOrder(monto) {
    const accessToken = await getAccessToken();
    const currency = process.env.PAYPAL_CURRENCY || 'USD';

    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            intent: 'CAPTURE',
            purchase_units: [
                {
                    amount: {
                        currency_code: currency,
                        value: Number(monto).toFixed(2)
                    }
                }
            ]
        })
    });

    const order = await response.json();

    if (!response.ok) {
        throw createHttpError(
            `No se pudo crear la orden de PayPal: ${order.message || response.status}`,
            502
        );
    }

    return order.id;
}

async function captureOrder(orderId) {
    const accessToken = await getAccessToken();

    const response = await fetch(
        `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderId}/capture`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        }
    );

    const capture = await response.json();

    if (!response.ok || capture.status !== 'COMPLETED') {
        throw createHttpError(
            `No se pudo capturar el pago de PayPal: ${capture.message || capture.status || response.status}`,
            402
        );
    }

    return capture;
}

// Captures the PayPal order and creates all related DB records atomically in sequence:
// donation → invoice → donation-invoice link → paypal payment record.
async function captureAndRecord({ orderId, idCampania, monto, mensaje, identificacion }) {
    const captureResult = await captureOrder(orderId);
    const captureId =
        captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    const donation = await donationService.createPublicDonation(
        { idCampania, monto, mensaje },
        identificacion
    );

    const idMoneda = await getInvoiceCurrencyId();

    const invoice = await invoiceService.createInvoice({
        idMoneda,
        tasaImpuestoAplicada: 0,
        fechaFactura: new Date(),
        idEstado: 1
    });

    await donationInvoiceRepository.createDonationInvoice({
        idDonacion: donation.idDonacion,
        idFactura: invoice.idFactura,
        idEstado: 1
    });

    await paypalPaymentRepository.createPayPalPayment({
        idFactura: invoice.idFactura,
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        fechaPago: new Date(),
        idEstado: 1
    });

    return donation;
}

module.exports = { createOrder, captureAndRecord };
