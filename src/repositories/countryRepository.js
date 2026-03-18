const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllCountriesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAISES_ADMIN_FN();
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

async function findCountryById(idPais) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAIS_POR_ID_FN(
          :idPais
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idPais,
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

async function createCountry(countryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAIS_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: countryData.nombre,
                idEstado: countryData.idEstado
            },
            { autoCommit: true }
        );

        const idPais = await getCurrentSequenceValue(connection, 'FIDE_PAIS_SEQ');
        if (!idPais) {
            throw new Error('No fue posible obtener el pais creado desde el package.');
        }

        return { idPais };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateCountry(countryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAIS_UPDATE_SP(
          :idPais,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPais: countryData.idPais,
                nombre: countryData.nombre,
                idEstado: countryData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteCountry(idPais) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PAIS_DELETE_SP(
          :idPais
        );
      END;
    `;

        await connection.execute(
            sql,
            { idPais },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllCountriesForAdmin,
    findCountryById,
    createCountry,
    updateCountry,
    deleteCountry
};
