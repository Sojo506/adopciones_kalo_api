const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllCurrenciesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_MONEDAS_ADMIN_FN();
      END;
    `;

        const result = await connection.execute(
            sql,
            {
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

async function findCurrencyById(idMoneda) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_MONEDA_POR_ID_FN(
          :idMoneda
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idMoneda,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds[OUT_CURSOR_BIND_NAME];

        try {
            const rows = await fetchRowsFromCursor(resultSet);
            return rows[0] || null;
        } finally {
            await resultSet.close();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveInvoicesByCurrency(idMoneda) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_FN();
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds[OUT_CURSOR_BIND_NAME];

        try {
            const invoices = await fetchRowsFromCursor(resultSet);

            return invoices.filter(
                (invoice) =>
                    Number(invoice.ID_MONEDA) === Number(idMoneda) &&
                    Number(invoice.ID_ESTADO) === 1
            ).length;
        } finally {
            await resultSet.close();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createCurrency(currencyData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MONEDA_INSERT_SP(
          :nombre,
          :simbolo,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: currencyData.nombre,
                simbolo: currencyData.simbolo,
                idEstado: currencyData.idEstado
            },
            { autoCommit: true }
        );

        const idMoneda = await getCurrentSequenceValue(connection, 'FIDE_MONEDA_SEQ');
        if (!idMoneda) {
            throw new Error('No fue posible obtener la moneda creada desde el package.');
        }

        return { idMoneda };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateCurrency(currencyData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MONEDA_UPDATE_SP(
          :idMoneda,
          :nombre,
          :simbolo,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idMoneda: currencyData.idMoneda,
                nombre: currencyData.nombre,
                simbolo: currencyData.simbolo,
                idEstado: currencyData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteCurrency(idMoneda) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MONEDA_DELETE_SP(
          :idMoneda
        );
      END;
    `;

        await connection.execute(
            sql,
            { idMoneda },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllCurrenciesForAdmin,
    findCurrencyById,
    countActiveInvoicesByCurrency,
    createCurrency,
    updateCurrency,
    deleteCurrency
};
