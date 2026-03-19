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

async function findAllMovementTypesForAdmin() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_MOVIMIENTO_ADMIN_FN()'
    );
}

async function findMovementTypeById(idTipoMovimiento) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_MOVIMIENTO_POR_ID_FN(:idTipoMovimiento)',
        { idTipoMovimiento }
    );

    return rows[0] || null;
}

async function countActiveInventoryMovementsByType(idTipoMovimiento) {
    const movements = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_MOVIMIENTOS_INVENTARIO_FN()'
    );

    return movements.filter(
        (movement) =>
            Number(movement.ID_TIPO_MOVIMIENTO) === Number(idTipoMovimiento) &&
            Number(movement.ID_ESTADO) === 1
    ).length;
}

async function countActiveSaleDetailsByType(idTipoMovimiento) {
    const saleDetails = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_VENTAS_PRODUCTO_FN()'
    );

    return saleDetails.filter(
        (detail) =>
            Number(detail.ID_TIPO_MOVIMIENTO) === Number(idTipoMovimiento) &&
            Number(detail.ID_ESTADO) === 1
    ).length;
}

async function createMovementType(movementTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_MOVIMIENTO_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: movementTypeData.nombre,
                idEstado: movementTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoMovimiento = await getCurrentSequenceValue(
            connection,
            'FIDE_TIPO_MOVIMIENTO_SEQ'
        );

        if (!idTipoMovimiento) {
            throw new Error(
                'No fue posible obtener el tipo de movimiento creado desde el package.'
            );
        }

        return { idTipoMovimiento };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateMovementType(movementTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_MOVIMIENTO_UPDATE_SP(
          :idTipoMovimiento,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoMovimiento: movementTypeData.idTipoMovimiento,
                nombre: movementTypeData.nombre,
                idEstado: movementTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteMovementType(idTipoMovimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_MOVIMIENTO_DELETE_SP(
          :idTipoMovimiento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoMovimiento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllMovementTypesForAdmin,
    findMovementTypeById,
    countActiveInventoryMovementsByType,
    countActiveSaleDetailsByType,
    createMovementType,
    updateMovementType,
    deleteMovementType
};
