const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllProvinces() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PROVINCIAS_FN();
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

async function findProvinceById(idProvincia) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PROVINCIA_POR_ID_FN(
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

async function createProvince(provinceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PROVINCIA_INSERT_SP(
          :nombre,
          :idPais,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: provinceData.nombre,
                idPais: provinceData.idPais,
                idEstado: provinceData.idEstado
            },
            { autoCommit: true }
        );

        const idProvincia = await getCurrentSequenceValue(connection, 'FIDE_PROVINCIA_SEQ');
        if (!idProvincia) {
            throw new Error('No fue posible obtener la provincia creada desde el package.');
        }

        return { idProvincia };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateProvince(provinceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PROVINCIA_UPDATE_SP(
          :idProvincia,
          :nombre,
          :idPais,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idProvincia: provinceData.idProvincia,
                nombre: provinceData.nombre,
                idPais: provinceData.idPais,
                idEstado: provinceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteProvince(idProvincia) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PROVINCIA_DELETE_SP(
          :idProvincia
        );
      END;
    `;

        await connection.execute(
            sql,
            { idProvincia },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllProvinces,
    findProvinceById,
    createProvince,
    updateProvince,
    deleteProvince
};
