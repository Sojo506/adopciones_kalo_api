const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

async function executeCursorQuery(sql, binds = {}) {
    let connection;

    try {
        connection = await getConnection();

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

async function findAvailableDogs() {
    return executeCursorQuery(`
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRO_DISPONIBLES_FN();
      END;
    `);
}

async function findDogById(idPerrito) {
    const rows = await executeCursorQuery(
        `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRO_POR_ID_FN(
          :idPerrito
        );
      END;
    `,
        { idPerrito }
    );

    return rows[0] || null;
}

async function findDogImages(idPerrito) {
    return executeCursorQuery(
        `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(
          :idPerrito
        );
      END;
    `,
        { idPerrito }
    );
}

module.exports = {
    findAvailableDogs,
    findDogById,
    findDogImages
};
