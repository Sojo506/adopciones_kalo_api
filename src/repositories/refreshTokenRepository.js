const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllRefreshTokens() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_REFRESH_TOKENS_FN();
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

async function findRefreshTokenById(idRefreshToken) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_REFRESH_TOKEN_POR_ID_FN(
          :idRefreshToken
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idRefreshToken,
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

async function createRefreshToken(refreshTokenData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_REFRESH_TOKEN_INSERT_SP(
          :idCuenta,
          :tokenHash,
          :jti,
          :ipAddress,
          :userAgent,
          :fechaExpiracion,
          :fechaRevocacion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCuenta: refreshTokenData.idCuenta,
                tokenHash: refreshTokenData.tokenHash,
                jti: refreshTokenData.jti,
                ipAddress: refreshTokenData.ipAddress,
                userAgent: refreshTokenData.userAgent,
                fechaExpiracion: refreshTokenData.fechaExpiracion,
                fechaRevocacion: refreshTokenData.fechaRevocacion,
                idEstado: refreshTokenData.idEstado
            },
            { autoCommit: true }
        );

        const idRefreshToken = await getCurrentSequenceValue(connection, 'FIDE_REFRESH_TOKEN_SEQ');
        if (!idRefreshToken) {
            throw new Error('No fue posible obtener el refresh token creado desde el package.');
        }

        return { idRefreshToken };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findRefreshTokensByCuenta(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_REFRESH_TOKENS_POR_CUENTA_FN(
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

async function updateRefreshToken(refreshTokenData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_REFRESH_TOKEN_UPDATE_SP(
          :idRefreshToken,
          :idCuenta,
          :tokenHash,
          :jti,
          :ipAddress,
          :userAgent,
          :fechaExpiracion,
          :fechaRevocacion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idRefreshToken: refreshTokenData.idRefreshToken,
                idCuenta: refreshTokenData.idCuenta,
                tokenHash: refreshTokenData.tokenHash,
                jti: refreshTokenData.jti,
                ipAddress: refreshTokenData.ipAddress,
                userAgent: refreshTokenData.userAgent,
                fechaExpiracion: refreshTokenData.fechaExpiracion,
                fechaRevocacion: refreshTokenData.fechaRevocacion,
                idEstado: refreshTokenData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteRefreshToken(idRefreshToken) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_REFRESH_TOKEN_DELETE_SP(
          :idRefreshToken
        );
      END;
    `;

        await connection.execute(
            sql,
            { idRefreshToken },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllRefreshTokens,
    findRefreshTokenById,
    createRefreshToken,
    findRefreshTokensByCuenta,
    updateRefreshToken,
    deleteRefreshToken
};
