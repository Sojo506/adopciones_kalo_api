const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

async function executeCursorFunction(functionCall, binds = {}) {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(connection, functionCall, binds);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function executeCursorFunctionWithConnection(connection, functionCall, binds = {}) {
    const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := ${functionCall};
      END;
    `;

    const result = await connection.execute(
        sql,
        {
            ...binds,
            [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
        },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
    );

    const resultSet = result.outBinds[OUT_CURSOR_BIND_NAME];

    try {
        return await fetchRowsFromCursor(resultSet);
    } finally {
        await resultSet.close();
    }
}

async function findAllInvoices() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_FN()');
}

async function findInvoiceById(idFactura) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURA_POR_ID_FN(:idFactura)',
        { idFactura }
    );

    return rows[0] || null;
}

async function countActiveSaleRelationsByInvoice(idFactura) {
    const saleInvoices = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTAS_FACTURA_FN()'
    );

    return saleInvoices.filter(
        (saleInvoice) =>
            String(saleInvoice.ID_FACTURA || '').trim() === String(idFactura).trim() &&
            Number(saleInvoice.ID_ESTADO) === 1
    ).length;
}

async function countActiveDonationRelationsByInvoice(idFactura) {
    const donationInvoices = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACIONES_FACTURA_FN()'
    );

    return donationInvoices.filter(
        (donationInvoice) =>
            String(donationInvoice.ID_FACTURA || '').trim() === String(idFactura).trim() &&
            Number(donationInvoice.ID_ESTADO) === 1
    ).length;
}

async function countActivePayPalPaymentsByInvoice(idFactura) {
    const payments = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAGOS_PAYPAL_POR_FACTURA_FN(:idFactura)',
        { idFactura }
    );

    return payments.filter((payment) => Number(payment.ID_ESTADO) === 1).length;
}

function normalizeInvoiceId(value) {
    return String(value || '').trim();
}

function normalizeDateTime(value) {
    if (!value) {
        return null;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return date.toISOString();
}

function roundTaxRate(value) {
    return Math.round(Number(value || 0) * 10000) / 10000;
}

function invoiceMatchesPayload(invoice, invoiceData) {
    return (
        Number(invoice.ID_MONEDA) === Number(invoiceData.idMoneda) &&
        Number(invoice.ID_ESTADO) === Number(invoiceData.idEstado) &&
        roundTaxRate(invoice.TASA_IMPUESTO_APLICADA) ===
            roundTaxRate(invoiceData.tasaImpuestoAplicada) &&
        normalizeDateTime(invoice.FECHA_FACTURA) === normalizeDateTime(invoiceData.fechaFactura)
    );
}

async function findCreatedInvoiceByPackage(connection, invoiceData, existingInvoiceIds) {
    const invoicesAfterInsert = await executeCursorFunctionWithConnection(
        connection,
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_FN()'
    );

    const newInvoices = invoicesAfterInsert.filter(
        (invoice) => !existingInvoiceIds.has(normalizeInvoiceId(invoice.ID_FACTURA))
    );

    const matchingNewInvoices = newInvoices.filter((invoice) =>
        invoiceMatchesPayload(invoice, invoiceData)
    );

    if (matchingNewInvoices.length > 0) {
        return matchingNewInvoices[0];
    }

    return newInvoices[0] || null;
}

async function createInvoice(invoiceData) {
    let connection;

    try {
        connection = await getConnection();
        const existingInvoices = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_FN()'
        );
        const existingInvoiceIds = new Set(
            existingInvoices.map((invoice) => normalizeInvoiceId(invoice.ID_FACTURA))
        );

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_FACTURA_INSERT_SP(
          :idMoneda,
          :tasaImpuestoAplicada,
          :fechaFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idMoneda: invoiceData.idMoneda,
                tasaImpuestoAplicada: invoiceData.tasaImpuestoAplicada,
                fechaFactura: invoiceData.fechaFactura,
                idEstado: invoiceData.idEstado
            },
            { autoCommit: true }
        );

        const createdInvoice = await findCreatedInvoiceByPackage(
            connection,
            invoiceData,
            existingInvoiceIds
        );

        if (!createdInvoice?.ID_FACTURA) {
            throw new Error('No fue posible obtener la factura creada desde el package.');
        }

        return { idFactura: createdInvoice.ID_FACTURA };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateInvoice(invoiceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_FACTURA_UPDATE_SP(
          :idFactura,
          :idMoneda,
          :tasaImpuestoAplicada,
          :fechaFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idFactura: invoiceData.idFactura,
                idMoneda: invoiceData.idMoneda,
                tasaImpuestoAplicada: invoiceData.tasaImpuestoAplicada,
                fechaFactura: invoiceData.fechaFactura,
                idEstado: invoiceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteInvoice(idFactura) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_FACTURA_DELETE_SP(
          :idFactura
        );
      END;
    `;

        await connection.execute(
            sql,
            { idFactura },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllInvoices,
    findInvoiceById,
    countActiveSaleRelationsByInvoice,
    countActiveDonationRelationsByInvoice,
    countActivePayPalPaymentsByInvoice,
    createInvoice,
    updateInvoice,
    deleteInvoice
};
