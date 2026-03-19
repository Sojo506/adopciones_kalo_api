const bcrypt = require('bcrypt');
const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

function normalizeOptionalText(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

function buildOtpUpdateBinds(otp, overrides = {}) {
    return {
        idCodigoOtp: otp.ID_CODIGO_OTP,
        idCuenta: otp.ID_CUENTA,
        idTipoOtp: otp.ID_TIPO_OTP,
        codigoHash: otp.CODIGO_HASH,
        fechaExpiracion: otp.FECHA_EXPIRACION,
        fechaUso: otp.FECHA_USO,
        intentos: otp.INTENTOS,
        fechaCreacion: otp.FECHA_CREACION,
        idEstado: otp.ID_ESTADO,
        ...overrides
    };
}

function buildAccountUpdateBinds(account, overrides = {}) {
    return {
        idCuenta: account.ID_CUENTA,
        identificacion: account.IDENTIFICACION,
        usuario: account.USUARIO,
        passwordHash: account.PASSWORD_HASH,
        idEstado: account.ID_ESTADO,
        ...overrides
    };
}

async function findAllUsers() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_USUARIOS_FN();
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

async function findUserDetailsByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_USUARIO_POR_IDENTIFICACION_FN(
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

async function findByIdentification(identificacion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_USUARIO_POR_IDENTIFICACION_FN(
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

async function createUser(userData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_USUARIO_INSERT_SP(
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

        await connection.execute(
            sql,
            {
                identificacion: userData.identificacion,
                nombre: userData.nombre,
                apellidoPaterno: userData.apellidoPaterno,
                apellidoMaterno: userData.apellidoMaterno,
                idDireccion: userData.idDireccion,
                idTipoUsuario: userData.idTipoUsuario,
                idEstado: userData.idEstado
            },
            { autoCommit: true }
        );

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

async function findAccountByIdCuenta(idCuenta) {
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

async function createAccount(accountData) {
    let connection;

    try {
        connection = await getConnection();

        const insertSql = `
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
            insertSql,
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

async function createOTP(otpData) {
    let connection;

    try {
        connection = await getConnection();

        const insertSql = `
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
            insertSql,
            {
                idCuenta: otpData.idCuenta,
                idTipoOtp: otpData.idTipoOtp,
                codigoHash: otpData.codigoHash,
                fechaExpiracion: otpData.fechaExpiracion,
                fechaUso: otpData.fechaUso ?? null,
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

async function updateUser(userData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_USUARIO_UPDATE_SP(
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

        await connection.execute(
            sql,
            {
                identificacion: userData.identificacion,
                nombre: userData.nombre,
                apellidoPaterno: userData.apellidoPaterno,
                apellidoMaterno: userData.apellidoMaterno,
                idDireccion: userData.idDireccion,
                idTipoUsuario: userData.idTipoUsuario,
                idEstado: userData.idEstado
            },
            { autoCommit: true }
        );
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

async function updateAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DIRECCION_UPDATE_SP(
          :idDireccion,
          :idDistrito,
          :calle,
          :numero,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDireccion: addressData.idDireccion,
                idDistrito: addressData.idDistrito,
                calle: normalizeOptionalText(addressData.calle),
                numero: normalizeOptionalText(addressData.numero),
                idEstado: addressData.idEstado
            },
            { autoCommit: true }
        );
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
        KALO.FIDE_KALO_PKG.FIDE_USUARIO_DELETE_SP(
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
        KALO.FIDE_KALO_PKG.FIDE_CUENTA_DELETE_SP(
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
        KALO.FIDE_KALO_PKG.FIDE_DIRECCION_DELETE_SP(
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

async function findOTPByCodeAndCuenta(codigo, idCuenta, idTipoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const readSql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_OTPS_ACTIVOS_POR_CUENTA_FN(
          :idCuenta,
          :idTipoOtp
        );
      END;
    `;

        const readResult = await connection.execute(
            readSql,
            {
                idCuenta,
                idTipoOtp,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const readResultSet = readResult.outBinds[OUT_CURSOR_BIND_NAME];
        const otps = await (async () => {
            try {
                return await fetchRowsFromCursor(readResultSet);
            } finally {
                await readResultSet.close();
            }
        })();

        const otp = otps[0];
        if (!otp) {
            return null;
        }

        const isValid = await bcrypt.compare(codigo, otp.CODIGO_HASH);
        if (!isValid) {
            const updateSql = `
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
                updateSql,
                buildOtpUpdateBinds(otp, { intentos: otp.INTENTOS + 1 }),
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

        const readSql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_OTP_POR_ID_FN(
          :idCodigoOtp
        );
      END;
    `;

        const readResult = await connection.execute(
            readSql,
            {
                idCodigoOtp,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const readResultSet = readResult.outBinds[OUT_CURSOR_BIND_NAME];
        const otp = await (async () => {
            try {
                const rows = await fetchRowsFromCursor(readResultSet);
                return rows[0] || null;
            } finally {
                await readResultSet.close();
            }
        })();

        if (!otp) {
            return;
        }

        const updateSql = `
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
            updateSql,
            buildOtpUpdateBinds(otp, {
                fechaUso: new Date(),
                idEstado: 2
            }),
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deactivateActiveOtpsByCuenta(idCuenta, idTipoOtp) {
    let connection;

    try {
        connection = await getConnection();

        const readSql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_OTPS_ACTIVOS_POR_CUENTA_FN(
          :idCuenta,
          :idTipoOtp
        );
      END;
    `;

        const readResult = await connection.execute(
            readSql,
            {
                idCuenta,
                idTipoOtp,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const readResultSet = readResult.outBinds[OUT_CURSOR_BIND_NAME];
        const otps = await (async () => {
            try {
                return await fetchRowsFromCursor(readResultSet);
            } finally {
                await readResultSet.close();
            }
        })();

        const deleteSql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CODIGO_OTP_DELETE_SP(
          :idCodigoOtp
        );
      END;
    `;

        for (const otp of otps) {
            await connection.execute(
                deleteSql,
                { idCodigoOtp: otp.ID_CODIGO_OTP },
                { autoCommit: true }
            );
        }
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

        const readSql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CUENTA_POR_ID_CUENTA_FN(
          :idCuenta
        );
      END;
    `;

        const readResult = await connection.execute(
            readSql,
            {
                idCuenta,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const readResultSet = readResult.outBinds[OUT_CURSOR_BIND_NAME];
        const account = await (async () => {
            try {
                const rows = await fetchRowsFromCursor(readResultSet);
                return rows[0] || null;
            } finally {
                await readResultSet.close();
            }
        })();

        if (!account) {
            return;
        }

        const updateSql = `
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
            updateSql,
            buildAccountUpdateBinds(account, { idEstado }),
            { autoCommit: true }
        );
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
