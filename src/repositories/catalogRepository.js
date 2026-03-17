const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function findUserTypes() {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_TIPO_USUARIO, NOMBRE, ID_ESTADO
              FROM KALO.FIDE_TIPO_USUARIO_TB
              WHERE ID_ESTADO = 1
              ORDER BY ID_TIPO_USUARIO
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findStates() {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_ESTADO, NOMBRE_ESTADO
              FROM KALO.FIDE_ESTADO_TB
              ORDER BY ID_ESTADO
            `,
            [],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = { findUserTypes, findStates };
