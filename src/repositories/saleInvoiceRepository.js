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

async function findAllSaleInvoices() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTAS_FACTURA_FN()');
}

async function findSaleInvoiceByPk(idVenta, idFactura) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTA_FACTURA_POR_PK_FN(:idVenta, :idFactura)',
        { idVenta, idFactura }
    );

    return rows[0] || null;
}

async function createSaleInvoice(saleInvoiceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_FACTURA_INSERT_SP(
          :idVenta,
          :idFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idVenta: saleInvoiceData.idVenta,
                idFactura: saleInvoiceData.idFactura,
                idEstado: saleInvoiceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateSaleInvoice(saleInvoiceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_FACTURA_UPDATE_SP(
          :idVenta,
          :idFactura,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idVenta: saleInvoiceData.idVenta,
                idFactura: saleInvoiceData.idFactura,
                idEstado: saleInvoiceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteSaleInvoice(idVenta, idFactura) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_FACTURA_DELETE_SP(
          :idVenta,
          :idFactura
        );
      END;
    `;

        await connection.execute(
            sql,
            { idVenta, idFactura },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllSaleInvoices,
    findSaleInvoiceByPk,
    createSaleInvoice,
    updateSaleInvoice,
    deleteSaleInvoice
};
