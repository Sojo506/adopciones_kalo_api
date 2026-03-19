const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllOtps() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_OTPS_FN();
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

async function findOtpById(idCodigoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_OTP_POR_ID_FN(
          :idCodigoOtp
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCodigoOtp,
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

async function createOtp(otpData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CODIGO_OTP_INSERT_SP(
          :idCuenta,
          :idTipoOtp,
          :codigoHash,
          :fechaExpiracion,
          :fechaUso,
          :intentos,
          :fechaCreacion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCuenta: otpData.idCuenta,
                idTipoOtp: otpData.idTipoOtp,
                codigoHash: otpData.codigoHash,
                fechaExpiracion: otpData.fechaExpiracion,
                fechaUso: otpData.fechaUso,
                intentos: otpData.intentos,
                fechaCreacion: otpData.fechaCreacion,
                idEstado: otpData.idEstado
            },
            { autoCommit: true }
        );

        const idCodigoOtp = await getCurrentSequenceValue(connection, 'FIDE_CODIGO_OTP_SEQ');
        if (!idCodigoOtp) {
            throw new Error('No fue posible obtener el OTP creado desde el package.');
        }

        return { idCodigoOtp };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateOtp(otpData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CODIGO_OTP_UPDATE_SP(
          :idCodigoOtp,
          :idCuenta,
          :idTipoOtp,
          :codigoHash,
          :fechaExpiracion,
          :fechaUso,
          :intentos,
          :fechaCreacion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCodigoOtp: otpData.idCodigoOtp,
                idCuenta: otpData.idCuenta,
                idTipoOtp: otpData.idTipoOtp,
                codigoHash: otpData.codigoHash,
                fechaExpiracion: otpData.fechaExpiracion,
                fechaUso: otpData.fechaUso,
                intentos: otpData.intentos,
                fechaCreacion: otpData.fechaCreacion,
                idEstado: otpData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteOtp(idCodigoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CODIGO_OTP_DELETE_SP(
          :idCodigoOtp
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCodigoOtp },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllOtps,
    findOtpById,
    createOtp,
    updateOtp,
    deleteOtp
};
