const { PAYPAL_BASE_URL, getAccessToken } = require('../config/paypal');
const { sendInvoiceEmail } = require('../config/email');
const { generateInvoicePdf } = require('../pdf/invoiceGenerator');
const currencyRepository = require('../repositories/currencyRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const inventoryMovementRepository = require('../repositories/inventoryMovementRepository');
const paypalPaymentRepository = require('../repositories/paypalPaymentRepository');
const productRepository = require('../repositories/productRepository');
const saleInvoiceRepository = require('../repositories/saleInvoiceRepository');
const saleProductRepository = require('../repositories/saleProductRepository');
const saleRepository = require('../repositories/saleRepository');
const userRepository = require('../repositories/userRepository');
const emailRepository = require('../repositories/emailRepository');
const inventoryMovementService = require('./inventoryMovementService');
const invoiceService = require('./invoiceService');
const saleService = require('./saleService');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

// ── PayPal helpers ────────────────────────────────────────────────────────

// PayPal no soporta CRC — se convierte a USD con tipo de cambio del .env
const CRC_USD_RATE = Number(process.env.CRC_USD_RATE || 505);

async function createOrder(totalCRC) {
    const accessToken = await getAccessToken();
    const totalUSD = (Number(totalCRC) / CRC_USD_RATE).toFixed(2);

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
                        currency_code: 'USD',
                        value: totalUSD
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

// ── Currency resolution ──────────────────────────────────────────────────

async function getInvoiceCurrency() {
    const currencies = await currencyRepository.findAllCurrenciesForAdmin();

    const envId = Number(process.env.PAYPAL_CURRENCY_ID);
    if (Number.isFinite(envId) && envId > 0) {
        const found = currencies.find((c) => Number(c.ID_MONEDA) === envId);
        if (found) {
            return { idMoneda: Number(found.ID_MONEDA), nombre: found.NOMBRE || '', simbolo: found.SIMBOLO || '₡' };
        }
    }

    const crc = currencies.find((c) => {
        const name = String(c.NOMBRE || '').toUpperCase();
        const symbol = String(c.SIMBOLO || '').trim();
        return name === 'CRC' || name.includes('COLON') || name.includes('COLÓN') || symbol === '₡';
    });

    if (crc) {
        return { idMoneda: Number(crc.ID_MONEDA), nombre: crc.NOMBRE || '', simbolo: crc.SIMBOLO || '₡' };
    }

    const active = currencies.find((c) => Number(c.ID_ESTADO) === 1);
    if (active) {
        return { idMoneda: Number(active.ID_MONEDA), nombre: active.NOMBRE || '', simbolo: active.SIMBOLO || '₡' };
    }

    throw createHttpError('No hay una moneda configurada para pagos.', 500);
}

// ── Movement type resolution ─────────────────────────────────────────────

const EGRESO_KEYWORDS = ['egreso', 'salida', 'venta', 'ajustenegativo'];

function normalizeKeyword(value) {
    return String(value || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '');
}

async function getEgresoMovementTypeId() {
    const types = await inventoryMovementRepository.findActiveMovementTypes();

    const egreso = types.find((t) => {
        const norm = normalizeKeyword(t.NOMBRE);
        return EGRESO_KEYWORDS.some((kw) => norm.includes(kw));
    });

    if (!egreso) {
        throw createHttpError('No se encontro un tipo de movimiento de egreso activo.', 500);
    }

    return Number(egreso.ID_TIPO_MOVIMIENTO);
}

// ── Validate cart items against real DB data ────────────────────────────

async function validateAndEnrichItems(items) {
    const enriched = [];

    for (const item of items) {
        const product = await productRepository.findProductById(item.idProducto);

        if (!product) {
            throw createHttpError(`Producto no encontrado: ${item.idProducto}`, 404);
        }

        if (Number(product.ID_ESTADO) !== 1) {
            throw createHttpError(`El producto "${product.NOMBRE}" no esta activo.`, 409);
        }

        const inventories = await inventoryRepository.findInventoriesByProductId(item.idProducto);

        if (!inventories.length || Number(inventories[0].ID_ESTADO) !== 1) {
            throw createHttpError(
                `El producto "${product.NOMBRE}" no tiene inventario disponible.`,
                409
            );
        }

        const availableStock = Number(inventories[0].CANTIDAD || 0);
        const requestedQty = Number(item.cantidad);

        if (requestedQty <= 0 || !Number.isInteger(requestedQty)) {
            throw createHttpError(
                `Cantidad invalida para "${product.NOMBRE}".`,
                400
            );
        }

        if (requestedQty > availableStock) {
            throw createHttpError(
                `Stock insuficiente para "${product.NOMBRE}". Disponible: ${availableStock}.`,
                409
            );
        }

        enriched.push({
            idProducto: Number(product.ID_PRODUCTO),
            nombre: product.NOMBRE || '',
            cantidad: requestedQty,
            precioUnitario: roundMoney(product.PRECIO),
            total: roundMoney(product.PRECIO * requestedQty)
        });
    }

    return enriched;
}

// ── Main checkout flow ──────────────────────────────────────────────────

async function captureAndRecord({ orderId, items, identificacion }) {
    // 1) Capture PayPal payment
    const captureResult = await captureOrder(orderId);
    const captureId =
        captureResult.purchase_units?.[0]?.payments?.captures?.[0]?.id || null;

    // 2) Validate items and compute totals using real DB prices
    const enrichedItems = await validateAndEnrichItems(items);
    const subtotal = roundMoney(enrichedItems.reduce((s, i) => s + i.total, 0));

    // 3) Resolve dependencies
    const [currency, idTipoMovimiento] = await Promise.all([
        getInvoiceCurrency(),
        getEgresoMovementTypeId()
    ]);

    // IVA ya viene incluido en el precio final de cada producto
    const TAX_RATE = Number(process.env.STORE_TAX_RATE || 0.13);
    const total = subtotal; // subtotal = suma de precios (ya incluyen IVA)
    const impuesto = roundMoney(total * TAX_RATE / (1 + TAX_RATE));
    const subtotalSinIva = roundMoney(total - impuesto);

    // 4) Create sale record
    const saleResult = await saleRepository.createSale({
        identificacion,
        totalVenta: total,
        fechaVenta: new Date(),
        idEstado: 1
    });
    const idVenta = saleResult.idVenta;

    // 5) Create sale-product detail lines + inventory movements (EGRESO)
    for (const item of enrichedItems) {
        await saleProductRepository.createSaleProduct({
            idVenta,
            idProducto: item.idProducto,
            idTipoMovimiento,
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            idEstado: 1
        });

        // Decrementar stock en la base de datos
        await inventoryMovementService.createInventoryMovement({
            idProducto: item.idProducto,
            idTipoMovimiento,
            cantidad: item.cantidad,
            fechaMovimiento: new Date(),
            idEstado: 1
        });
    }

    // 6) Create invoice
    const invoice = await invoiceService.createInvoice({
        idMoneda: currency.idMoneda,
        tasaImpuestoAplicada: TAX_RATE,
        fechaFactura: new Date(),
        idEstado: 1
    });

    // 7) Link sale to invoice
    await saleInvoiceRepository.createSaleInvoice({
        idVenta,
        idFactura: invoice.idFactura,
        idEstado: 1
    });

    // 8) Record PayPal payment
    await paypalPaymentRepository.createPayPalPayment({
        idFactura: invoice.idFactura,
        paypalOrderId: orderId,
        paypalCaptureId: captureId,
        fechaPago: new Date(),
        idEstado: 1
    });

    // Invalidate caches
    saleService.invalidateSaleQueryCaches(idVenta);
    invoiceService.invalidateInvoiceQueryCaches(invoice.idFactura);

    // 9) Get customer data for PDF / email
    const user = await userRepository.findByIdentification(identificacion);
    const clienteName = [user?.NOMBRE, user?.APELLIDO_PATERNO, user?.APELLIDO_MATERNO]
        .filter(Boolean)
        .join(' ') || 'Cliente';

    const emails = await emailRepository.findEmailsByIdentification(identificacion);
    const primaryEmail = emails?.find((e) => Number(e.ID_ESTADO) === 1);
    const correo = primaryEmail?.CORREO || null;

    // 10) Generate invoice PDF
    const pdfBuffer = await generateInvoicePdf({
        idFactura: invoice.idFactura,
        fecha: invoice.fechaFactura,
        cliente: clienteName,
        correo: correo || '',
        moneda: currency.nombre,
        simbolo: currency.simbolo,
        tasaImpuesto: TAX_RATE,
        subtotal: subtotalSinIva,
        impuesto,
        total,
        items: enrichedItems
    });

    // 11) Send invoice email (non-blocking – don't fail checkout if email fails)
    if (correo) {
        sendInvoiceEmail(correo, pdfBuffer, invoice.idFactura).catch((err) => {
            console.error('Failed to send invoice email:', err);
        });
    }

    return {
        idVenta,
        idFactura: invoice.idFactura,
        total,
        pdfBase64: pdfBuffer.toString('base64')
    };
}

module.exports = { createOrder, captureAndRecord };
