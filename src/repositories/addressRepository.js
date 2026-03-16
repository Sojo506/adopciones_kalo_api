const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function createAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();

        const idSql = `SELECT NVL(MAX(ID_DIRECCION), 0) + 1 AS NEXT_ID FROM KALO.FIDE_DIRECCION_TB`;
        const idResult = await connection.execute(idSql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
        const nextId = idResult.rows[0].NEXT_ID;

        const sql = `
      BEGIN
        KALO.FIDE_INSERT_PKG.FIDE_DIRECCION_INSERT_SP(
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
                idDireccion: nextId,
                idDistrito: addressData.idDistrito,
                calle: addressData.calle || null,
                numero: addressData.numero || null,
                idEstado: 1
            },
            { autoCommit: true }
        );

        return { idDireccion: nextId };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = { createAddress };
