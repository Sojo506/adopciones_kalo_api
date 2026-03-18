const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllStates() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_ESTADOS_FN();
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

async function findStateById(idEstado) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_ESTADO_POR_ID_FN(
          :idEstado
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idEstado,
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

async function createState(stateData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ESTADO_INSERT_SP(
          :nombreEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            { nombreEstado: stateData.nombreEstado },
            { autoCommit: true }
        );

        const idEstado = await getCurrentSequenceValue(connection, 'FIDE_ESTADO_SEQ');
        if (!idEstado) {
            throw new Error('No fue posible obtener el estado creado desde el package.');
        }

        return { idEstado };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateState(stateData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ESTADO_UPDATE_SP(
          :idEstado,
          :nombreEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idEstado: stateData.idEstado,
                nombreEstado: stateData.nombreEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteState(idEstado) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ESTADO_DELETE_SP(
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            { idEstado },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllStates,
    findStateById,
    createState,
    updateState,
    deleteState
};
