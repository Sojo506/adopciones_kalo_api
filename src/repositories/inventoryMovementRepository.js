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

async function findAllInventoryMovementsForAdmin() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_ADMIN_FN()'
    );
}

async function findInventoryMovementById(idMovimiento) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_MOVIMIENTO_INVENTARIO_POR_ID_FN(:idMovimiento)',
        { idMovimiento }
    );

    return rows[0] || null;
}

async function findActiveMovementTypes() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_MOVIMIENTO_FN()'
    );
}

async function findMovementTypeById(idTipoMovimiento) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_MOVIMIENTO_POR_ID_FN(:idTipoMovimiento)',
        { idTipoMovimiento }
    );

    return rows[0] || null;
}

async function createInventoryMovement(movementData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MOVIMIENTO_INVENTARIO_INSERT_SP(
          :idProducto,
          :idTipoMovimiento,
          :cantidad,
          :fechaMovimiento,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idProducto: movementData.idProducto,
                idTipoMovimiento: movementData.idTipoMovimiento,
                cantidad: movementData.cantidad,
                fechaMovimiento: movementData.fechaMovimiento,
                idEstado: movementData.idEstado
            },
            { autoCommit: true }
        );

        const idMovimiento = await getCurrentSequenceValue(
            connection,
            'FIDE_MOVIMIENTO_INVENTARIO_SEQ'
        );

        if (!idMovimiento) {
            throw new Error(
                'No fue posible obtener el movimiento de inventario creado desde el package.'
            );
        }

        return { idMovimiento };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateInventoryMovement(movementData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MOVIMIENTO_INVENTARIO_UPDATE_SP(
          :idMovimiento,
          :idProducto,
          :idTipoMovimiento,
          :cantidad,
          :fechaMovimiento,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idMovimiento: movementData.idMovimiento,
                idProducto: movementData.idProducto,
                idTipoMovimiento: movementData.idTipoMovimiento,
                cantidad: movementData.cantidad,
                fechaMovimiento: movementData.fechaMovimiento,
                idEstado: movementData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteInventoryMovement(idMovimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MOVIMIENTO_INVENTARIO_DELETE_SP(
          :idMovimiento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idMovimiento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllInventoryMovementsForAdmin,
    findInventoryMovementById,
    findActiveMovementTypes,
    findMovementTypeById,
    createInventoryMovement,
    updateInventoryMovement,
    deleteInventoryMovement
};
