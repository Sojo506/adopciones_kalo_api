const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

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

async function findAllDonationInvoices() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACIONES_FACTURA_FN()');
}

async function findDonationInvoiceByPk(idDonacion, idFactura) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACION_FACTURA_POR_PK_FN(:idDonacion, :idFactura)',
        { idDonacion, idFactura }
    );

    return rows[0] || null;
}

async function createDonationInvoice(donationInvoiceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_FACTURA_INSERT_SP(
          :idDonacion,
          :idFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDonacion: donationInvoiceData.idDonacion,
                idFactura: donationInvoiceData.idFactura,
                idEstado: donationInvoiceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDonationInvoice(donationInvoiceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_FACTURA_UPDATE_SP(
          :idDonacion,
          :idFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDonacion: donationInvoiceData.idDonacion,
                idFactura: donationInvoiceData.idFactura,
                idEstado: donationInvoiceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDonationInvoice(idDonacion, idFactura) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_FACTURA_DELETE_SP(
          :idDonacion,
          :idFactura
        );
      END;
    `;

        await connection.execute(
            sql,
            { idDonacion, idFactura },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllDonationInvoices,
    findDonationInvoiceByPk,
    createDonationInvoice,
    updateDonationInvoice,
    deleteDonationInvoice
};
