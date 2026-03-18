const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllUserTypesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_USUARIO_ADMIN_FN();
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

async function findUserTypeById(idTipoUsuario) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_USUARIO_POR_ID_FN(
          :idTipoUsuario
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idTipoUsuario,
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

async function createUserType(userTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_USUARIO_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: userTypeData.nombre,
                idEstado: userTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoUsuario = await getCurrentSequenceValue(connection, 'FIDE_TIPO_USUARIO_SEQ');
        if (!idTipoUsuario) {
            throw new Error('No fue posible obtener el tipo de usuario creado desde el package.');
        }

        return { idTipoUsuario };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateUserType(userTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_USUARIO_UPDATE_SP(
          :idTipoUsuario,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoUsuario: userTypeData.idTipoUsuario,
                nombre: userTypeData.nombre,
                idEstado: userTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteUserType(idTipoUsuario) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_USUARIO_DELETE_SP(
          :idTipoUsuario
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoUsuario },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllUserTypesForAdmin,
    findUserTypeById,
    createUserType,
    updateUserType,
    deleteUserType
};
