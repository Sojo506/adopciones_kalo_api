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

async function createAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();
        const calle = normalizeOptionalText(addressData.calle);
        const numero = normalizeOptionalText(addressData.numero);

        const insertSql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DIRECCION_INSERT_SP(
          :idDistrito,
          :calle,
          :numero,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            insertSql,
            {
                idDistrito: addressData.idDistrito,
                calle,
                numero,
                idEstado: 1
            },
            { autoCommit: true }
        );

        const idDireccion = await getCurrentSequenceValue(connection, 'FIDE_DIRECCION_SEQ');
        if (!idDireccion) {
            throw new Error('No fue posible obtener el ID de la direccion creada desde el package.');
        }

        return { idDireccion };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findAllAddresses() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DIRECCIONES_FN();
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

async function findAddressById(idDireccion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DIRECCION_POR_ID_FN(
          :idDireccion
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idDireccion,
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

        await connection.execute(
            sql,
            { idDireccion },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    createAddress,
    findAllAddresses,
    findAddressById,
    updateAddress,
    deleteAddress
};
