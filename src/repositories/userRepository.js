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

module.exports = { findAllUsers };
