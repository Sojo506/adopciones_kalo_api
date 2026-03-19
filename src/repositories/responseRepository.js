const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    getCurrentSequenceValue,
    qualifyDbObjectName
} = require('./repositoryUtils');

const RESPONSE_TABLE = qualifyDbObjectName('FIDE_RESPUESTA_TB');
const REQUEST_TABLE = qualifyDbObjectName('FIDE_SOLICITUD_TB');
const USER_TABLE = qualifyDbObjectName('FIDE_USUARIO_TB');
const REQUEST_TYPE_TABLE = qualifyDbObjectName('FIDE_TIPO_SOLICITUD_TB');
const QUESTION_TABLE = qualifyDbObjectName('FIDE_PREGUNTA_TB');
const RESPONSE_TYPE_TABLE = qualifyDbObjectName('FIDE_TIPO_RESPUESTA_TB');
const STATE_TABLE = qualifyDbObjectName('FIDE_ESTADO_TB');

async function findAllResponsesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT
            R.ID_RESPUESTA,
            R.ID_SOLICITUD,
            S.IDENTIFICACION,
            U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
            S.ID_TIPO_SOLICITUD,
            TS.NOMBRE AS TIPO_SOLICITUD,
            R.ID_PREGUNTA,
            P.PREGUNTA,
            P.ID_TIPO_RESPUESTA,
            TR.NOMBRE AS TIPO_RESPUESTA,
            R.RESPUESTA,
            R.ID_ESTADO,
            E.NOMBRE_ESTADO AS ESTADO_RESPUESTA
        FROM ${RESPONSE_TABLE} R
        JOIN ${REQUEST_TABLE} S ON R.ID_SOLICITUD = S.ID_SOLICITUD
        JOIN ${USER_TABLE} U ON S.IDENTIFICACION = U.IDENTIFICACION
        JOIN ${REQUEST_TYPE_TABLE} TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
        JOIN ${QUESTION_TABLE} P ON R.ID_PREGUNTA = P.ID_PREGUNTA
        JOIN ${RESPONSE_TYPE_TABLE} TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
        JOIN ${STATE_TABLE} E ON R.ID_ESTADO = E.ID_ESTADO
        ORDER BY R.ID_RESPUESTA DESC
      `,
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

async function findResponseById(idRespuesta) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT
            R.ID_RESPUESTA,
            R.ID_SOLICITUD,
            S.IDENTIFICACION,
            U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
            S.ID_TIPO_SOLICITUD,
            TS.NOMBRE AS TIPO_SOLICITUD,
            R.ID_PREGUNTA,
            P.PREGUNTA,
            P.ID_TIPO_RESPUESTA,
            TR.NOMBRE AS TIPO_RESPUESTA,
            R.RESPUESTA,
            R.ID_ESTADO,
            E.NOMBRE_ESTADO AS ESTADO_RESPUESTA
        FROM ${RESPONSE_TABLE} R
        JOIN ${REQUEST_TABLE} S ON R.ID_SOLICITUD = S.ID_SOLICITUD
        JOIN ${USER_TABLE} U ON S.IDENTIFICACION = U.IDENTIFICACION
        JOIN ${REQUEST_TYPE_TABLE} TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
        JOIN ${QUESTION_TABLE} P ON R.ID_PREGUNTA = P.ID_PREGUNTA
        JOIN ${RESPONSE_TYPE_TABLE} TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
        JOIN ${STATE_TABLE} E ON R.ID_ESTADO = E.ID_ESTADO
        WHERE R.ID_RESPUESTA = :idRespuesta
      `,
            { idRespuesta },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows?.[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findResponseByRequestQuestion(idSolicitud, idPregunta, { excludeId = null } = {}) {
    let connection;

    try {
        connection = await getConnection();

        const conditions = [
            'ID_SOLICITUD = :idSolicitud',
            'ID_PREGUNTA = :idPregunta'
        ];
        const binds = { idSolicitud, idPregunta };

        if (excludeId !== null && excludeId !== undefined) {
            conditions.push('ID_RESPUESTA != :excludeId');
            binds.excludeId = excludeId;
        }

        const result = await connection.execute(
            `
        SELECT
            ID_RESPUESTA,
            ID_SOLICITUD,
            ID_PREGUNTA,
            RESPUESTA,
            ID_ESTADO
        FROM ${RESPONSE_TABLE}
        WHERE ${conditions.join('\n          AND ')}
        ORDER BY ID_RESPUESTA DESC
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

async function createResponse(responseData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_RESPUESTA_INSERT_SP(
          :idSolicitud,
          :idPregunta,
          :respuesta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSolicitud: responseData.idSolicitud,
                idPregunta: responseData.idPregunta,
                respuesta: responseData.respuesta,
                idEstado: responseData.idEstado
            },
            { autoCommit: true }
        );

        const idRespuesta = await getCurrentSequenceValue(connection, 'FIDE_RESPUESTA_SEQ');

        if (!idRespuesta) {
            throw new Error('No fue posible obtener la respuesta creada desde el package.');
        }

        return { idRespuesta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateResponse(responseData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_RESPUESTA_UPDATE_SP(
          :idRespuesta,
          :idSolicitud,
          :idPregunta,
          :respuesta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idRespuesta: responseData.idRespuesta,
                idSolicitud: responseData.idSolicitud,
                idPregunta: responseData.idPregunta,
                respuesta: responseData.respuesta,
                idEstado: responseData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteResponse(idRespuesta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_RESPUESTA_DELETE_SP(
          :idRespuesta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idRespuesta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllResponsesForAdmin,
    findResponseById,
    findResponseByRequestQuestion,
    createResponse,
    updateResponse,
    deleteResponse
};
