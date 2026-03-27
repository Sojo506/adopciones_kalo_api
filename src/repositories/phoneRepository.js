const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

async function findAllPhones() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TELEFONOS_FN();
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

async function findPhoneByNumber(telefono) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TELEFONO_POR_NUMERO_FN(
          :telefono
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                telefono,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds[OUT_CURSOR_BIND_NAME];

        try {
            const rows = await fetchRowsFromCursor(resultSet);
            return rows.find((row) => Number(row.ID_ESTADO) === 1) || rows[0] || null;
        } finally {
            await resultSet.close();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findPhonesByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TELEFONOS_USUARIO_FN(
          :identificacion
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                identificacion,
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

async function findPhoneByPk(identificacion, telefono) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TELEFONO_POR_PK_FN(
          :identificacion,
          :telefono
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                identificacion,
                telefono,
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

async function createPhone(phoneData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TELEFONO_INSERT_SP(
          :identificacion,
          :telefono,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: phoneData.identificacion,
                telefono: phoneData.telefono,
                idEstado: phoneData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updatePhone(phoneData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TELEFONO_UPDATE_SP(
          :identificacion,
          :telefono,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: phoneData.identificacion,
                telefono: phoneData.telefono,
                idEstado: phoneData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deletePhone(identificacion, telefono) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TELEFONO_DELETE_SP(
          :identificacion,
          :telefono
        );
      END;
    `;

        await connection.execute(
            sql,
            { identificacion, telefono },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllPhones,
    findPhonesByIdentification,
    findPhoneByNumber,
    findPhoneByPk,
    createPhone,
    updatePhone,
    deletePhone
};
