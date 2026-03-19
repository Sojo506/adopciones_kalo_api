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

async function findAllSaleProducts() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTAS_PRODUCTO_FN()'
    );
}

async function findSaleProductsBySaleId(idVenta) {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLE_VENTA_FN(:idVenta)',
        { idVenta }
    );
}

async function findSaleProductByPk(idVenta, idProducto) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTA_PRODUCTO_POR_PK_FN(:idVenta, :idProducto)',
        { idVenta, idProducto }
    );

    return rows[0] || null;
}

async function createSaleProduct(saleProductData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_PRODUCTO_INSERT_SP(
          :idVenta,
          :idProducto,
          :idTipoMovimiento,
          :cantidad,
          :precioUnitario,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idVenta: saleProductData.idVenta,
                idProducto: saleProductData.idProducto,
                idTipoMovimiento: saleProductData.idTipoMovimiento,
                cantidad: saleProductData.cantidad,
                precioUnitario: saleProductData.precioUnitario,
                idEstado: saleProductData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateSaleProduct(saleProductData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_PRODUCTO_UPDATE_SP(
          :idVenta,
          :idProducto,
          :idTipoMovimiento,
          :cantidad,
          :precioUnitario,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idVenta: saleProductData.idVenta,
                idProducto: saleProductData.idProducto,
                idTipoMovimiento: saleProductData.idTipoMovimiento,
                cantidad: saleProductData.cantidad,
                precioUnitario: saleProductData.precioUnitario,
                idEstado: saleProductData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteSaleProduct(idVenta, idProducto) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_VENTA_PRODUCTO_DELETE_SP(
          :idVenta,
          :idProducto
        );
      END;
    `;

        await connection.execute(
            sql,
            { idVenta, idProducto },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllSaleProducts,
    findSaleProductsBySaleId,
    findSaleProductByPk,
    createSaleProduct,
    updateSaleProduct,
    deleteSaleProduct
};
