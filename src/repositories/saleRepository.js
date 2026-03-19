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

async function findAllSales() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTAS_FN()');
}

async function findSaleById(idVenta) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTA_POR_ID_FN(:idVenta)',
        { idVenta }
    );

    return rows[0] || null;
}

async function countActiveSaleDetails(idVenta) {
    const details = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLE_VENTA_FN(:idVenta)',
        { idVenta }
    );

    return details.filter((detail) => Number(detail.ID_ESTADO) === 1).length;
}

async function countActiveSaleInvoices(idVenta) {
    const invoices = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_FACTURAS_VENTA_FN(:idVenta)',
        { idVenta }
    );

    return invoices.filter((invoice) => Number(invoice.ID_ESTADO) === 1).length;
}

async function createSale(saleData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_INSERT_SP(
          :identificacion,
          :totalVenta,
          :fechaVenta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: saleData.identificacion,
                totalVenta: saleData.totalVenta,
                fechaVenta: saleData.fechaVenta,
                idEstado: saleData.idEstado
            },
            { autoCommit: true }
        );

        const idVenta = await getCurrentSequenceValue(connection, 'FIDE_VENTA_SEQ');

        if (!idVenta) {
            throw new Error('No fue posible obtener la venta creada desde el package.');
        }

        return { idVenta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateSale(saleData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_UPDATE_SP(
          :idVenta,
          :identificacion,
          :totalVenta,
          :fechaVenta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idVenta: saleData.idVenta,
                identificacion: saleData.identificacion,
                totalVenta: saleData.totalVenta,
                fechaVenta: saleData.fechaVenta,
                idEstado: saleData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteSale(idVenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_DELETE_SP(
          :idVenta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idVenta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllSales,
    findSaleById,
    countActiveSaleDetails,
    countActiveSaleInvoices,
    createSale,
    updateSale,
    deleteSale
};
