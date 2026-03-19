const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllAccounts() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CUENTAS_FN();
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

async function findAccountById(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CUENTA_POR_ID_CUENTA_FN(
          :idCuenta
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCuenta,
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

async function findAccountByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CUENTA_POR_IDENTIFICACION_FN(
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

async function findAccountByUsuario(usuario) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CUENTA_POR_CORREO_FN(
          :usuario
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                usuario,
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

async function createAccount(accountData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CUENTA_INSERT_SP(
          :identificacion,
          :usuario,
          :passwordHash,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: accountData.identificacion,
                usuario: accountData.usuario,
                passwordHash: accountData.passwordHash,
                idEstado: accountData.idEstado
            },
            { autoCommit: true }
        );

        const idCuenta = await getCurrentSequenceValue(connection, 'FIDE_CUENTA_SEQ');
        if (!idCuenta) {
            throw new Error('No fue posible obtener la cuenta creada desde el package.');
        }

        return { idCuenta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateAccount(accountData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CUENTA_UPDATE_SP(
          :idCuenta,
          :identificacion,
          :usuario,
          :passwordHash,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCuenta: accountData.idCuenta,
                identificacion: accountData.identificacion,
                usuario: accountData.usuario,
                passwordHash: accountData.passwordHash,
                idEstado: accountData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteAccount(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CUENTA_DELETE_SP(
          :idCuenta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCuenta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllAccounts,
    findAccountById,
    findAccountByIdentification,
    findAccountByUsuario,
    createAccount,
    updateAccount,
    deleteAccount
};
