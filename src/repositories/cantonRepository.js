const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllCantons() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CANTONES_FN();
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

async function findCantonById(idCanton) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CANTON_POR_ID_FN(
          :idCanton
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCanton,
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

async function createCanton(cantonData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CANTON_INSERT_SP(
          :nombre,
          :idProvincia,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: cantonData.nombre,
                idProvincia: cantonData.idProvincia,
                idEstado: cantonData.idEstado
            },
            { autoCommit: true }
        );

        const idCanton = await getCurrentSequenceValue(connection, 'FIDE_CANTON_SEQ');
        if (!idCanton) {
            throw new Error('No fue posible obtener el canton creado desde el package.');
        }

        return { idCanton };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateCanton(cantonData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CANTON_UPDATE_SP(
          :idCanton,
          :nombre,
          :idProvincia,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCanton: cantonData.idCanton,
                nombre: cantonData.nombre,
                idProvincia: cantonData.idProvincia,
                idEstado: cantonData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteCanton(idCanton) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CANTON_DELETE_SP(
          :idCanton
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCanton },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllCantons,
    findCantonById,
    createCanton,
    updateCanton,
    deleteCanton
};
