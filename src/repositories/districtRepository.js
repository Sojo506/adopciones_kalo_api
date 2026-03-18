const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllDistricts() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DISTRITOS_FN();
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

async function findDistrictById(idDistrito) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DISTRITO_POR_ID_FN(
          :idDistrito
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
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

async function createDistrict(districtData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DISTRITO_INSERT_SP(
          :nombre,
          :idCanton,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: districtData.nombre,
                idCanton: districtData.idCanton,
                idEstado: districtData.idEstado
            },
            { autoCommit: true }
        );

        const idDistrito = await getCurrentSequenceValue(connection, 'FIDE_DISTRITO_SEQ');
        if (!idDistrito) {
            throw new Error('No fue posible obtener el distrito creado desde el package.');
        }

        return { idDistrito };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDistrict(districtData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DISTRITO_UPDATE_SP(
          :idDistrito,
          :nombre,
          :idCanton,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDistrito: districtData.idDistrito,
                nombre: districtData.nombre,
                idCanton: districtData.idCanton,
                idEstado: districtData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDistrict(idDistrito) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DISTRITO_DELETE_SP(
          :idDistrito
        );
      END;
    `;

        await connection.execute(
            sql,
            { idDistrito },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllDistricts,
    findDistrictById,
    createDistrict,
    updateDistrict,
    deleteDistrict
};
