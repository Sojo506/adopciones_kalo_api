const oracledb = require('oracledb');
const { getConnection } = require('../config/db');

async function findCountries() {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_PAIS, NOMBRE
              FROM KALO.FIDE_PAIS_TB
              WHERE ID_ESTADO = 1
              ORDER BY NOMBRE
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

async function findProvincesByCountry(idPais) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_PROVINCIA, NOMBRE, ID_PAIS
              FROM KALO.FIDE_PROVINCIA_TB
              WHERE ID_ESTADO = 1
                AND ID_PAIS = :idPais
              ORDER BY NOMBRE
            `,
            [idPais],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findCantonsByProvince(idProvincia) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_CANTON, NOMBRE, ID_PROVINCIA
              FROM KALO.FIDE_CANTON_TB
              WHERE ID_ESTADO = 1
                AND ID_PROVINCIA = :idProvincia
              ORDER BY NOMBRE
            `,
            [idProvincia],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findDistrictsByCanton(idCanton) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT ID_DISTRITO, NOMBRE, ID_CANTON
              FROM KALO.FIDE_DISTRITO_TB
              WHERE ID_ESTADO = 1
                AND ID_CANTON = :idCanton
              ORDER BY NOMBRE
            `,
            [idCanton],
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findDistrictHierarchy({ idPais, idProvincia, idCanton, idDistrito }) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
              SELECT
                PA.ID_PAIS,
                PA.NOMBRE AS PAIS,
                PRO.ID_PROVINCIA,
                PRO.NOMBRE AS PROVINCIA,
                CAN.ID_CANTON,
                CAN.NOMBRE AS CANTON,
                DIS.ID_DISTRITO,
                DIS.NOMBRE AS DISTRITO
              FROM KALO.FIDE_DISTRITO_TB DIS
              JOIN KALO.FIDE_CANTON_TB CAN ON DIS.ID_CANTON = CAN.ID_CANTON
              JOIN KALO.FIDE_PROVINCIA_TB PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
              JOIN KALO.FIDE_PAIS_TB PA ON PRO.ID_PAIS = PA.ID_PAIS
              WHERE PA.ID_ESTADO = 1
                AND PRO.ID_ESTADO = 1
                AND CAN.ID_ESTADO = 1
                AND DIS.ID_ESTADO = 1
                AND PA.ID_PAIS = :idPais
                AND PRO.ID_PROVINCIA = :idProvincia
                AND CAN.ID_CANTON = :idCanton
                AND DIS.ID_DISTRITO = :idDistrito
            `,
            { idPais, idProvincia, idCanton, idDistrito },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findCountries,
    findProvincesByCountry,
    findCantonsByProvince,
    findDistrictsByCanton,
    findDistrictHierarchy
};
