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

async function findAllInventoriesForAdmin() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_INVENTARIOS_ADMIN_FN()'
    );
}

async function findInventoryById(idInventario) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_INVENTARIO_POR_ID_FN(:idInventario)',
        { idInventario }
    );

    return rows[0] || null;
}

async function findInventoriesByProductId(idProducto) {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_INVENTARIOS_POR_PRODUCTO_FN(:idProducto)',
        { idProducto }
    );
}

async function createInventory(inventoryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_INVENTARIO_INSERT_SP(
          :idProducto,
          :cantidad,
          :idEstado,
          :stockMinimo
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idProducto: inventoryData.idProducto,
                cantidad: inventoryData.cantidad,
                idEstado: inventoryData.idEstado,
                stockMinimo: inventoryData.stockMinimo
            },
            { autoCommit: true }
        );

        const idInventario = await getCurrentSequenceValue(connection, 'FIDE_INVENTARIO_SEQ');

        if (!idInventario) {
            throw new Error('No fue posible obtener el inventario creado desde el package.');
        }

        return { idInventario };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateInventory(inventoryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_INVENTARIO_UPDATE_SP(
          :idInventario,
          :idProducto,
          :cantidad,
          :idEstado,
          :stockMinimo
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idInventario: inventoryData.idInventario,
                idProducto: inventoryData.idProducto,
                cantidad: inventoryData.cantidad,
                idEstado: inventoryData.idEstado,
                stockMinimo: inventoryData.stockMinimo
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteInventory(idInventario) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_INVENTARIO_DELETE_SP(
          :idInventario
        );
      END;
    `;

        await connection.execute(
            sql,
            { idInventario },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllInventoriesForAdmin,
    findInventoryById,
    findInventoriesByProductId,
    createInventory,
    updateInventory,
    deleteInventory
};
