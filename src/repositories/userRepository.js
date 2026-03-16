const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function findAllUsers() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        U.IDENTIFICACION,
        U.NOMBRE,
        U.APELLIDO_PATERNO,
        U.APELLIDO_MATERNO,
        U.FECHA_REGISTRO,
        U.ID_DIRECCION,
        U.ID_TIPO_USUARIO,
        TU.NOMBRE AS TIPO_USUARIO,
        U.ID_ESTADO,
        EU.NOMBRE_ESTADO AS ESTADO_USUARIO,
        C.ID_CUENTA,
        C.USUARIO AS CORREO,
        C.ID_ESTADO AS ID_ESTADO_CUENTA,
        EC.NOMBRE_ESTADO AS ESTADO_CUENTA,
        DIR.ID_DISTRITO,
        DIR.CALLE,
        DIR.NUMERO,
        DIS.NOMBRE AS DISTRITO,
        CAN.ID_CANTON,
        CAN.NOMBRE AS CANTON,
        PRO.ID_PROVINCIA,
        PRO.NOMBRE AS PROVINCIA,
        PA.ID_PAIS,
        PA.NOMBRE AS PAIS
      FROM KALO.FIDE_USUARIO_TB
      U
      LEFT JOIN KALO.FIDE_CUENTA_TB C ON U.IDENTIFICACION = C.IDENTIFICACION
      LEFT JOIN KALO.FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
      LEFT JOIN KALO.FIDE_ESTADO_TB EU ON U.ID_ESTADO = EU.ID_ESTADO
      LEFT JOIN KALO.FIDE_ESTADO_TB EC ON C.ID_ESTADO = EC.ID_ESTADO
      LEFT JOIN KALO.FIDE_DIRECCION_TB DIR ON U.ID_DIRECCION = DIR.ID_DIRECCION
      LEFT JOIN KALO.FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
      LEFT JOIN KALO.FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
      LEFT JOIN KALO.FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
      LEFT JOIN KALO.FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
      ORDER BY U.IDENTIFICACION
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

async function findUserDetailsByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      SELECT
        U.IDENTIFICACION,
        U.NOMBRE,
        U.APELLIDO_PATERNO,
        U.APELLIDO_MATERNO,
        U.FECHA_REGISTRO,
        U.ID_DIRECCION,
        U.ID_TIPO_USUARIO,
        TU.NOMBRE AS TIPO_USUARIO,
        U.ID_ESTADO,
        EU.NOMBRE_ESTADO AS ESTADO_USUARIO,
        C.ID_CUENTA,
        C.USUARIO AS CORREO,
        C.PASSWORD_HASH,
        C.ID_ESTADO AS ID_ESTADO_CUENTA,
        EC.NOMBRE_ESTADO AS ESTADO_CUENTA,
        DIR.ID_DISTRITO,
        DIR.CALLE,
        DIR.NUMERO,
        DIS.NOMBRE AS DISTRITO,
        CAN.ID_CANTON,
        CAN.NOMBRE AS CANTON,
        PRO.ID_PROVINCIA,
        PRO.NOMBRE AS PROVINCIA,
        PA.ID_PAIS,
        PA.NOMBRE AS PAIS
      FROM KALO.FIDE_USUARIO_TB U
      LEFT JOIN KALO.FIDE_CUENTA_TB C ON U.IDENTIFICACION = C.IDENTIFICACION
      LEFT JOIN KALO.FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
      LEFT JOIN KALO.FIDE_ESTADO_TB EU ON U.ID_ESTADO = EU.ID_ESTADO
      LEFT JOIN KALO.FIDE_ESTADO_TB EC ON C.ID_ESTADO = EC.ID_ESTADO
      LEFT JOIN KALO.FIDE_DIRECCION_TB DIR ON U.ID_DIRECCION = DIR.ID_DIRECCION
      LEFT JOIN KALO.FIDE_DISTRITO_TB DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
      LEFT JOIN KALO.FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
      LEFT JOIN KALO.FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
      LEFT JOIN KALO.FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
      WHERE U.IDENTIFICACION = :identificacion
    `;

        const result = await connection.execute(sql, { identificacion }, {
            outFormat: oracledb.OUT_FORMAT_OBJECT
        });

        return result.rows[0] || null;
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
        U.APELLIDO_MATERNO,
        U.ID_TIPO_USUARIO,
        TU.NOMBRE AS TIPO_USUARIO
      FROM KALO.FIDE_CUENTA_TB C
      JOIN KALO.FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
      JOIN KALO.FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
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
        U.APELLIDO_MATERNO,
        U.ID_TIPO_USUARIO,
        TU.NOMBRE AS TIPO_USUARIO
      FROM KALO.FIDE_CUENTA_TB C
      JOIN KALO.FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
      JOIN KALO.FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
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

async function findAccountByIdentification(identificacion) {
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
        U.APELLIDO_MATERNO,
        U.ID_TIPO_USUARIO,
        TU.NOMBRE AS TIPO_USUARIO
      FROM KALO.FIDE_CUENTA_TB C
      JOIN KALO.FIDE_USUARIO_TB U ON C.IDENTIFICACION = U.IDENTIFICACION
      JOIN KALO.FIDE_TIPO_USUARIO_TB TU ON U.ID_TIPO_USUARIO = TU.ID_TIPO_USUARIO
      WHERE C.IDENTIFICACION = :identificacion
    `;

        const result = await connection.execute(sql, { identificacion }, {
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

async function updateUser(userData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_UPDATE_PKG.FIDE_USUARIO_UPDATE_SP(
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

        await connection.execute(sql, {
            identificacion: userData.identificacion,
            nombre: userData.nombre,
            apellidoPaterno: userData.apellidoPaterno,
            apellidoMaterno: userData.apellidoMaterno,
            idDireccion: userData.idDireccion,
            idTipoUsuario: userData.idTipoUsuario,
            idEstado: userData.idEstado
        }, { autoCommit: true });
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
        KALO.FIDE_UPDATE_PKG.FIDE_CUENTA_UPDATE_SP(
          :idCuenta,
          :identificacion,
          :usuario,
          :passwordHash,
          :idEstado
        );
      END;
    `;

        await connection.execute(sql, {
            idCuenta: accountData.idCuenta,
            identificacion: accountData.identificacion,
            usuario: accountData.usuario,
            passwordHash: accountData.passwordHash,
            idEstado: accountData.idEstado
        }, { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_UPDATE_PKG.FIDE_DIRECCION_UPDATE_SP(
          :idDireccion,
          :idDistrito,
          :calle,
          :numero,
          :idEstado
        );
      END;
    `;

        await connection.execute(sql, {
            idDireccion: addressData.idDireccion,
            idDistrito: addressData.idDistrito,
            calle: addressData.calle || null,
            numero: addressData.numero || null,
            idEstado: addressData.idEstado
        }, { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteUser(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_DELETE_PKG.FIDE_USUARIO_DELETE_SP(
          :identificacion
        );
      END;
    `;

        await connection.execute(sql, { identificacion }, { autoCommit: true });
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
        KALO.FIDE_DELETE_PKG.FIDE_CUENTA_DELETE_SP(
          :idCuenta
        );
      END;
    `;

        await connection.execute(sql, { idCuenta }, { autoCommit: true });
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteAddress(idDireccion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_DELETE_PKG.FIDE_DIRECCION_DELETE_SP(
          :idDireccion
        );
      END;
    `;

        await connection.execute(sql, { idDireccion }, { autoCommit: true });
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
    findUserDetailsByIdentification,
    findByIdentification,
    createUser,
    findAccountByUsuario,
    findAccountByIdCuenta,
    findAccountByIdentification,
    createAccount,
    createOTP,
    findOTPByCodeAndCuenta,
    markOTPAsUsed,
    deactivateActiveOtpsByCuenta,
    updateAccountStatus,
    updateUser,
    updateAccount,
    updateAddress,
    deleteUser,
    deleteAccount,
    deleteAddress
};
