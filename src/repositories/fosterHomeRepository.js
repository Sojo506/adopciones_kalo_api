const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    getCurrentSequenceValue,
    qualifyDbObjectName
} = require('./repositoryUtils');

const FOSTER_HOME_TABLE = qualifyDbObjectName('FIDE_CASA_CUNA_TB');
const ADDRESS_TABLE = qualifyDbObjectName('FIDE_DIRECCION_TB');
const DISTRICT_TABLE = qualifyDbObjectName('FIDE_DISTRITO_TB');
const CANTON_TABLE = qualifyDbObjectName('FIDE_CANTON_TB');
const PROVINCE_TABLE = qualifyDbObjectName('FIDE_PROVINCIA_TB');
const COUNTRY_TABLE = qualifyDbObjectName('FIDE_PAIS_TB');
const USER_TABLE = qualifyDbObjectName('FIDE_USUARIO_TB');
const REQUEST_TABLE = qualifyDbObjectName('FIDE_SOLICITUD_TB');
const REQUEST_TYPE_TABLE = qualifyDbObjectName('FIDE_TIPO_SOLICITUD_TB');
const STATE_TABLE = qualifyDbObjectName('FIDE_ESTADO_TB');
const HOUSE_DOG_TABLE = qualifyDbObjectName('FIDE_CASA_PERRITO_TB');

function normalizeOptionalForeignKey(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

async function findAllFosterHomes() {
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            sql,
            {},
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );
        return result.rows || [];
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

const sql = `
    SELECT
        CC.ID_CASA_CUNA,
        CC.NOMBRE,
        CC.ID_DIRECCION,
        DIR.ID_DISTRITO,
        DIS.NOMBRE AS DISTRITO,
        CAN.ID_CANTON,
        CAN.NOMBRE AS CANTON,
        PRO.ID_PROVINCIA,
        PRO.NOMBRE AS PROVINCIA,
        PA.ID_PAIS,
        PA.NOMBRE AS PAIS,
        DIR.CALLE,
        DIR.NUMERO,
        CC.IDENTIFICACION,
        U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS ENCARGADO,
        CC.ID_SOLICITUD,
        S.ID_TIPO_SOLICITUD,
        TS.NOMBRE AS TIPO_SOLICITUD,
        (
            SELECT COUNT(*)
            FROM ${HOUSE_DOG_TABLE} CP
            WHERE CP.ID_CASA_CUNA = CC.ID_CASA_CUNA
              AND CP.ID_ESTADO = 1
        ) AS TOTAL_PERRITOS,
        CC.ID_ESTADO,
        E.NOMBRE_ESTADO AS ESTADO
    FROM ${FOSTER_HOME_TABLE} CC
    JOIN ${ADDRESS_TABLE} DIR ON CC.ID_DIRECCION = DIR.ID_DIRECCION
    JOIN ${DISTRICT_TABLE} DIS ON DIR.ID_DISTRITO = DIS.ID_DISTRITO
    JOIN ${CANTON_TABLE} CAN ON DIS.ID_CANTON = CAN.ID_CANTON
    JOIN ${PROVINCE_TABLE} PRO ON CAN.ID_PROVINCIA = PRO.ID_PROVINCIA
    JOIN ${COUNTRY_TABLE} PA ON PRO.ID_PAIS = PA.ID_PAIS
    JOIN ${USER_TABLE} U ON CC.IDENTIFICACION = U.IDENTIFICACION
    LEFT JOIN ${REQUEST_TABLE} S ON CC.ID_SOLICITUD = S.ID_SOLICITUD
    LEFT JOIN ${REQUEST_TYPE_TABLE} TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
    JOIN ${STATE_TABLE} E ON CC.ID_ESTADO = E.ID_ESTADO
`;

async function findFosterHomeById(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `
        ${sql}
        WHERE CC.ID_CASA_CUNA = :idCasaCuna
      `,
            { idCasaCuna },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows?.[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findFosterHomeByRequestId(idSolicitud, { excludeId = null } = {}) {
    if (idSolicitud === undefined || idSolicitud === null || idSolicitud === '') {
        return null;
    }

    let connection;

    try {
        connection = await getConnection();
        const conditions = ['ID_SOLICITUD = :idSolicitud'];
        const binds = { idSolicitud };

        if (excludeId !== null && excludeId !== undefined) {
            conditions.push('ID_CASA_CUNA != :excludeId');
            binds.excludeId = excludeId;
        }

        const result = await connection.execute(
            `
        SELECT
            ID_CASA_CUNA,
            ID_SOLICITUD,
            ID_ESTADO
        FROM ${FOSTER_HOME_TABLE}
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY ID_CASA_CUNA DESC
        FETCH FIRST 1 ROWS ONLY
      `,
            binds,
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows?.[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveDogAssignmentsByFosterHome(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `
        SELECT COUNT(*) AS TOTAL
        FROM ${HOUSE_DOG_TABLE}
        WHERE ID_CASA_CUNA = :idCasaCuna
          AND ID_ESTADO = 1
      `,
            { idCasaCuna },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return Number(result.rows?.[0]?.TOTAL || 0);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createFosterHome(fosterHomeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_INSERT_SP(
          :nombre,
          :idDireccion,
          :identificacion,
          :idSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: fosterHomeData.nombre,
                idDireccion: fosterHomeData.idDireccion,
                identificacion: fosterHomeData.identificacion,
                idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
                idEstado: fosterHomeData.idEstado
            },
            { autoCommit: true }
        );

        const idCasaCuna = await getCurrentSequenceValue(connection, 'FIDE_CASA_CUNA_SEQ');

        if (!idCasaCuna) {
            throw new Error('No fue posible obtener la casa cuna creada desde el package.');
        }

        return { idCasaCuna };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateFosterHome(fosterHomeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_UPDATE_SP(
          :idCasaCuna,
          :nombre,
          :idDireccion,
          :identificacion,
          :idSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCasaCuna: fosterHomeData.idCasaCuna,
                nombre: fosterHomeData.nombre,
                idDireccion: fosterHomeData.idDireccion,
                identificacion: fosterHomeData.identificacion,
                idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
                idEstado: fosterHomeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteFosterHome(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_DELETE_SP(
          :idCasaCuna
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCasaCuna },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllFosterHomes,
    findFosterHomeById,
    findFosterHomeByRequestId,
    countActiveDogAssignmentsByFosterHome,
    createFosterHome,
    updateFosterHome,
    deleteFosterHome
};
