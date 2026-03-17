const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function createAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_INSERT_PKG.FIDE_DIRECCION_INSERT_SP(
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
                idDistrito: addressData.idDistrito,
                calle: addressData.calle || null,
                numero: addressData.numero || null,
                idEstado: 1
            },
            { autoCommit: true }
        );

        const idResult = await connection.execute(
            `SELECT KALO.FIDE_DIRECCION_SEQ.CURRVAL AS ID_DIRECCION FROM DUAL`,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return { idDireccion: idResult.rows[0].ID_DIRECCION };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = { createAddress };
