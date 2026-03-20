const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function executeCursorFunction(functionCall, binds = {}) {
    let connection;

    try {
        connection = await getConnection();

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
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findAllPayPalPayments() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAGOS_PAYPAL_FN()');
}

async function findPayPalPaymentById(idPago) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAGO_PAYPAL_POR_ID_FN(:idPago)',
        { idPago }
    );

    return rows[0] || null;
}

async function createPayPalPayment(paypalPaymentData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAGO_PAYPAL_INSERT_SP(
          :idFactura,
          :paypalOrderId,
          :paypalCaptureId,
          :fechaPago,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idFactura: paypalPaymentData.idFactura,
                paypalOrderId: paypalPaymentData.paypalOrderId,
                paypalCaptureId: paypalPaymentData.paypalCaptureId,
                fechaPago: paypalPaymentData.fechaPago,
                idEstado: paypalPaymentData.idEstado
            },
            { autoCommit: true }
        );

        const idPago = await getCurrentSequenceValue(connection, 'FIDE_PAGO_PAYPAL_SEQ');

        if (!idPago) {
            throw new Error('No fue posible obtener el pago PayPal creado desde el package.');
        }

        return { idPago };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updatePayPalPayment(paypalPaymentData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAGO_PAYPAL_UPDATE_SP(
          :idPago,
          :idFactura,
          :paypalOrderId,
          :paypalCaptureId,
          :fechaPago,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPago: paypalPaymentData.idPago,
                idFactura: paypalPaymentData.idFactura,
                paypalOrderId: paypalPaymentData.paypalOrderId,
                paypalCaptureId: paypalPaymentData.paypalCaptureId,
                fechaPago: paypalPaymentData.fechaPago,
                idEstado: paypalPaymentData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deletePayPalPayment(idPago) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAGO_PAYPAL_DELETE_SP(
          :idPago
        );
      END;
    `;

        await connection.execute(
            sql,
            { idPago },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllPayPalPayments,
    findPayPalPaymentById,
    createPayPalPayment,
    updatePayPalPayment,
    deletePayPalPayment
};
