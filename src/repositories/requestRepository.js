const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue,
    qualifyDbObjectName
} = require('./repositoryUtils');

const REQUEST_QUESTION_TABLE = qualifyDbObjectName('FIDE_SOLICITUD_PREGUNTA_TB');
const RESPONSE_TABLE = qualifyDbObjectName('FIDE_RESPUESTA_TB');
const ADOPTION_TABLE = qualifyDbObjectName('FIDE_ADOPCION_TB');
const FOSTER_HOME_TABLE = qualifyDbObjectName('FIDE_CASA_CUNA_TB');

async function findAllRequestsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_FN();
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

async function findRequestById(idSolicitud) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUD_POR_ID_FN(
          :idSolicitud
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idSolicitud,
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

async function getActiveDependencySummaryByRequest(idSolicitud) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT
            (SELECT COUNT(*)
             FROM ${REQUEST_QUESTION_TABLE}
             WHERE ID_SOLICITUD = :idSolicitud
               AND ID_ESTADO = 1) AS ACTIVE_ASSIGNMENTS,
            (SELECT COUNT(*)
             FROM ${RESPONSE_TABLE}
             WHERE ID_SOLICITUD = :idSolicitud
               AND ID_ESTADO = 1) AS ACTIVE_RESPONSES,
            (SELECT COUNT(*)
             FROM ${ADOPTION_TABLE}
             WHERE ID_SOLICITUD = :idSolicitud
               AND ID_ESTADO = 1) AS ACTIVE_ADOPTIONS,
            (SELECT COUNT(*)
             FROM ${FOSTER_HOME_TABLE}
             WHERE ID_SOLICITUD = :idSolicitud
               AND ID_ESTADO = 1) AS ACTIVE_FOSTER_HOMES
        FROM DUAL
      `,
            { idSolicitud },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return {
            activeAssignments: Number(result.rows?.[0]?.ACTIVE_ASSIGNMENTS || 0),
            activeResponses: Number(result.rows?.[0]?.ACTIVE_RESPONSES || 0),
            activeAdoptions: Number(result.rows?.[0]?.ACTIVE_ADOPTIONS || 0),
            activeFosterHomes: Number(result.rows?.[0]?.ACTIVE_FOSTER_HOMES || 0)
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createRequest(requestData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_INSERT_SP(
          :identificacion,
          :idTipoSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: requestData.identificacion,
                idTipoSolicitud: requestData.idTipoSolicitud,
                idEstado: requestData.idEstado
            },
            { autoCommit: true }
        );

        const idSolicitud = await getCurrentSequenceValue(connection, 'FIDE_SOLICITUD_SEQ');

        if (!idSolicitud) {
            throw new Error('No fue posible obtener la solicitud creada desde el package.');
        }

        return { idSolicitud };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateRequest(requestData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_UPDATE_SP(
          :idSolicitud,
          :identificacion,
          :idTipoSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSolicitud: requestData.idSolicitud,
                identificacion: requestData.identificacion,
                idTipoSolicitud: requestData.idTipoSolicitud,
                idEstado: requestData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteRequest(idSolicitud) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_DELETE_SP(
          :idSolicitud
        );
      END;
    `;

        await connection.execute(
            sql,
            { idSolicitud },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllRequestsForAdmin,
    findRequestById,
    getActiveDependencySummaryByRequest,
    createRequest,
    updateRequest,
    deleteRequest
};
