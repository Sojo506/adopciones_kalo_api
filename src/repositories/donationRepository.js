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

async function findAllDonations() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACIONES_FN()');
}

async function findDonationById(idDonacion) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACION_POR_ID_FN(:idDonacion)',
        { idDonacion }
    );

    return rows[0] || null;
}

async function countActiveDonationInvoices(idDonacion) {
    const invoices = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_DONACION_FN(:idDonacion)',
        { idDonacion }
    );

    return invoices.filter((invoice) => Number(invoice.ID_ESTADO) === 1).length;
}

async function createDonation(donationData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_INSERT_SP(
          :identificacion,
          :idCampania,
          :monto,
          :fechaDonacion,
          :mensaje,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: donationData.identificacion,
                idCampania: donationData.idCampania,
                monto: donationData.monto,
                fechaDonacion: donationData.fechaDonacion,
                mensaje: donationData.mensaje,
                idEstado: donationData.idEstado
            },
            { autoCommit: true }
        );

        const idDonacion = await getCurrentSequenceValue(connection, 'FIDE_DONACION_SEQ');

        if (!idDonacion) {
            throw new Error('No fue posible obtener la donacion creada desde el package.');
        }

        return { idDonacion };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDonation(donationData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_UPDATE_SP(
          :idDonacion,
          :identificacion,
          :idCampania,
          :monto,
          :fechaDonacion,
          :mensaje,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDonacion: donationData.idDonacion,
                identificacion: donationData.identificacion,
                idCampania: donationData.idCampania,
                monto: donationData.monto,
                fechaDonacion: donationData.fechaDonacion,
                mensaje: donationData.mensaje,
                idEstado: donationData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDonation(idDonacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DONACION_DELETE_SP(
          :idDonacion
        );
      END;
    `;

        await connection.execute(
            sql,
            { idDonacion },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllDonations,
    findDonationById,
    countActiveDonationInvoices,
    createDonation,
    updateDonation,
    deleteDonation
};
