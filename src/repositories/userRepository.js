const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function findAllUsers() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        IDENTIFICACION,
        NOMBRE,
        APELLIDO_PATERNO,
        APELLIDO_MATERNO,
        FECHA_REGISTRO,
        ID_DIRECCION,
        ID_TIPO_USUARIO,
        ID_ESTADO
      FROM KALO.FIDE_USUARIO_TB
      ORDER BY IDENTIFICACION
    `;

        const result = await connection.execute(sql, [], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        IDENTIFICACION,
        NOMBRE,
        APELLIDO_PATERNO,
        APELLIDO_MATERNO,
        FECHA_REGISTRO,
        ID_DIRECCION,
        ID_TIPO_USUARIO,
        ID_ESTADO
      FROM KALO.FIDE_USUARIO_TB
      WHERE IDENTIFICACION = :identificacion
    `;

        const result = await connection.execute(sql, [identificacion], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return result.rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createUser(userData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_INSERT_PKG.FIDE_USUARIO_INSERT_SP(
          :identificacion,
          :nombre,
          :apellidoPaterno,
          :apellidoMaterno,
          :idDireccion,
          :idTipoUsuario,
          :idEstado
        );
      END;
    `;

        const binds = {
            identificacion: userData.identificacion,
            nombre: userData.nombre,
            apellidoPaterno: userData.apellidoPaterno,
            apellidoMaterno: userData.apellidoMaterno,
            idDireccion: userData.idDireccion,
            idTipoUsuario: userData.idTipoUsuario,
            idEstado: userData.idEstado
        };

        await connection.execute(sql, binds, { autoCommit: true });

        return { identificacion: userData.identificacion };
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
      SELECT
        C.ID_CUENTA,
        C.IDENTIFICACION,
        C.USUARIO,
        C.PASSWORD_HASH,
        C.FECHA_REGISTRO,
        C.ID_ESTADO,
        U.NOMBRE,
        U.APELLIDO_PATERNO,
        U.APELLIDO_MATERNO
      FROM KALO.FIDE_CUENTA_TB C
      JOIN KALO.FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
      WHERE C.USUARIO = :usuario
    `;

        const result = await connection.execute(sql, [usuario], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return result.rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findAccountByIdCuenta(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        C.ID_CUENTA,
        C.IDENTIFICACION,
        C.USUARIO,
        C.PASSWORD_HASH,
        C.FECHA_REGISTRO,
        C.ID_ESTADO,
        U.NOMBRE,
        U.APELLIDO_PATERNO,
        U.APELLIDO_MATERNO
      FROM KALO.FIDE_CUENTA_TB C
      JOIN KALO.FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
      WHERE C.ID_CUENTA = :idCuenta
    `;

        const result = await connection.execute(sql, [idCuenta], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return result.rows[0] || null;
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

        // Get next ID_CUENTA
        const idSql = `SELECT NVL(MAX(ID_CUENTA), 0) + 1 AS NEXT_ID FROM KALO.FIDE_CUENTA_TB`;
        const idResult = await connection.execute(idSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const nextId = idResult.rows[0].NEXT_ID;

        const sql = `
      BEGIN
        KALO.FIDE_INSERT_PKG.FIDE_CUENTA_INSERT_SP(
          :idCuenta,
          :identificacion,
          :usuario,
          :passwordHash,
          :idEstado
        );
      END;
    `;

        const binds = {
            idCuenta: nextId,
            identificacion: accountData.identificacion,
            usuario: accountData.usuario,
            passwordHash: accountData.passwordHash,
            idEstado: accountData.idEstado
        };

        await connection.execute(sql, binds, { autoCommit: true });

        return { idCuenta: nextId };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createOTP(otpData) {
    let connection;

    try {
        connection = await getConnection();

        // Get next ID_CODIGO_OTP
        const idSql = `SELECT NVL(MAX(ID_CODIGO_OTP), 0) + 1 AS NEXT_ID FROM KALO.FIDE_CODIGO_OTP_TB`;
        const idResult = await connection.execute(idSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const nextId = idResult.rows[0].NEXT_ID;

        const sql = `
      BEGIN
        KALO.FIDE_INSERT_PKG.FIDE_CODIGO_OTP_INSERT_SP(
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

        const binds = {
            idCodigoOtp: nextId,
            idCuenta: otpData.idCuenta,
            idTipoOtp: otpData.idTipoOtp,
            codigoHash: otpData.codigoHash,
            fechaExpiracion: otpData.fechaExpiracion,
            fechaUso: otpData.fechaUso ?? null,
            intentos: otpData.intentos,
            fechaCreacion: otpData.fechaCreacion,
            idEstado: otpData.idEstado
        };

        await connection.execute(sql, binds, { autoCommit: true });

        return { idCodigoOtp: nextId, codigo: otpData.codigo };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findOTPByCodeAndCuenta(codigo, idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        ID_CODIGO_OTP,
        ID_CUENTA,
        ID_TIPO_OTP,
        CODIGO_HASH,
        FECHA_EXPIRACION,
        FECHA_USO,
        INTENTOS,
        FECHA_CREACION,
        ID_ESTADO
      FROM KALO.FIDE_CODIGO_OTP_TB
      WHERE ID_CUENTA = :idCuenta
        AND ID_TIPO_OTP = 1
        AND ID_ESTADO = 1
        AND FECHA_EXPIRACION > SYSDATE
        AND INTENTOS < 5
      ORDER BY FECHA_CREACION DESC
      FETCH FIRST 1 ROWS ONLY
    `;

        const result = await connection.execute(sql, [idCuenta], {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        const otp = result.rows[0];
        if (!otp) return null;

        // Verify code
        const bcrypt = require('bcrypt');
        const isValid = await bcrypt.compare(codigo, otp.CODIGO_HASH);
        if (!isValid) {
            // Increment attempts
            await connection.execute(
                `UPDATE KALO.FIDE_CODIGO_OTP_TB SET INTENTOS = INTENTOS + 1 WHERE ID_CODIGO_OTP = :id`,
                [otp.ID_CODIGO_OTP],
                { autoCommit: true }
            );
            return null;
        }

        return otp;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function markOTPAsUsed(idCodigoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      UPDATE KALO.FIDE_CODIGO_OTP_TB
      SET FECHA_USO = SYSDATE,
          ID_ESTADO = 2
      WHERE ID_CODIGO_OTP = :idCodigoOtp
    `;

        await connection.execute(sql, [idCodigoOtp], { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deactivateActiveOtpsByCuenta(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      UPDATE KALO.FIDE_CODIGO_OTP_TB
      SET ID_ESTADO = 2
      WHERE ID_CUENTA = :idCuenta
        AND ID_TIPO_OTP = 1
        AND ID_ESTADO = 1
    `;

        await connection.execute(sql, [idCuenta], { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateAccountStatus(idCuenta, idEstado) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      UPDATE KALO.FIDE_CUENTA_TB
      SET ID_ESTADO = :idEstado
      WHERE ID_CUENTA = :idCuenta
    `;

        await connection.execute(sql, { idCuenta, idEstado }, { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllUsers,
    findByIdentification,
    createUser,
    findAccountByUsuario,
    findAccountByIdCuenta,
    createAccount,
    createOTP,
    findOTPByCodeAndCuenta,
    markOTPAsUsed,
    deactivateActiveOtpsByCuenta,
    updateAccountStatus
};
