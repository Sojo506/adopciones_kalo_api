const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllOtpTypesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_OTP_ADMIN_FN();
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

async function findOtpTypeById(idTipoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_OTP_POR_ID_FN(
          :idTipoOtp
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idTipoOtp,
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

async function createOtpType(otpTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_OTP_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: otpTypeData.nombre,
                idEstado: otpTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoOtp = await getCurrentSequenceValue(connection, 'FIDE_TIPO_OTP_SEQ');
        if (!idTipoOtp) {
            throw new Error('No fue posible obtener el tipo OTP creado desde el package.');
        }

        return { idTipoOtp };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateOtpType(otpTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_OTP_UPDATE_SP(
          :idTipoOtp,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoOtp: otpTypeData.idTipoOtp,
                nombre: otpTypeData.nombre,
                idEstado: otpTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteOtpType(idTipoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_OTP_DELETE_SP(
          :idTipoOtp
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoOtp },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllOtpTypesForAdmin,
    findOtpTypeById,
    createOtpType,
    updateOtpType,
    deleteOtpType
};
