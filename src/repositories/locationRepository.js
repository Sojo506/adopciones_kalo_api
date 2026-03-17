const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

async function findCountries() {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PAISES_FN();
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

async function findProvincesByCountry(idPais) {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PROVINCIAS_POR_PAIS_FN(
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

async function findCantonsByProvince(idProvincia) {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CANTONES_POR_PROVINCIA_FN(
          :idProvincia
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idProvincia,
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

async function findDistrictsByCanton(idCanton) {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DISTRITOS_POR_CANTON_FN(
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

async function findDistrictHierarchy({ idPais, idProvincia, idCanton, idDistrito }) {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_JERARQUIA_DISTRITO_FN(
          :idPais,
          :idProvincia,
          :idCanton,
          :idDistrito
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idPais,
                idProvincia,
                idCanton,
                idDistrito,
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

module.exports = {
    findCountries,
    findProvincesByCountry,
    findCantonsByProvince,
    findDistrictsByCanton,
    findDistrictHierarchy
};
