const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { qualifyDbObjectName } = require('./repositoryUtils');

const REQUEST_QUESTION_TABLE = qualifyDbObjectName('FIDE_SOLICITUD_PREGUNTA_TB');
const REQUEST_TABLE = qualifyDbObjectName('FIDE_SOLICITUD_TB');
const USER_TABLE = qualifyDbObjectName('FIDE_USUARIO_TB');
const REQUEST_TYPE_TABLE = qualifyDbObjectName('FIDE_TIPO_SOLICITUD_TB');
const QUESTION_TABLE = qualifyDbObjectName('FIDE_PREGUNTA_TB');
const RESPONSE_TYPE_TABLE = qualifyDbObjectName('FIDE_TIPO_RESPUESTA_TB');
const STATE_TABLE = qualifyDbObjectName('FIDE_ESTADO_TB');
const RESPONSE_TABLE = qualifyDbObjectName('FIDE_RESPUESTA_TB');

async function findAllRequestQuestionsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT
            SP.ID_SOLICITUD,
            S.IDENTIFICACION,
            U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
            S.ID_TIPO_SOLICITUD,
            TS.NOMBRE AS TIPO_SOLICITUD,
            SP.ID_PREGUNTA,
            P.PREGUNTA,
            P.ID_TIPO_RESPUESTA,
            TR.NOMBRE AS TIPO_RESPUESTA,
            SP.ID_ESTADO,
            E.NOMBRE_ESTADO AS ESTADO_RELACION
        FROM ${REQUEST_QUESTION_TABLE} SP
        JOIN ${REQUEST_TABLE} S ON SP.ID_SOLICITUD = S.ID_SOLICITUD
        JOIN ${USER_TABLE} U ON S.IDENTIFICACION = U.IDENTIFICACION
        JOIN ${REQUEST_TYPE_TABLE} TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
        JOIN ${QUESTION_TABLE} P ON SP.ID_PREGUNTA = P.ID_PREGUNTA
        JOIN ${RESPONSE_TYPE_TABLE} TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
        JOIN ${STATE_TABLE} E ON SP.ID_ESTADO = E.ID_ESTADO
        ORDER BY SP.ID_SOLICITUD DESC, SP.ID_PREGUNTA ASC
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

async function findRequestQuestionByPk(idSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT
            SP.ID_SOLICITUD,
            S.IDENTIFICACION,
            U.NOMBRE || ' ' || U.APELLIDO_PATERNO || ' ' || U.APELLIDO_MATERNO AS SOLICITANTE,
            S.ID_TIPO_SOLICITUD,
            TS.NOMBRE AS TIPO_SOLICITUD,
            SP.ID_PREGUNTA,
            P.PREGUNTA,
            P.ID_TIPO_RESPUESTA,
            TR.NOMBRE AS TIPO_RESPUESTA,
            SP.ID_ESTADO,
            E.NOMBRE_ESTADO AS ESTADO_RELACION
        FROM ${REQUEST_QUESTION_TABLE} SP
        JOIN ${REQUEST_TABLE} S ON SP.ID_SOLICITUD = S.ID_SOLICITUD
        JOIN ${USER_TABLE} U ON S.IDENTIFICACION = U.IDENTIFICACION
        JOIN ${REQUEST_TYPE_TABLE} TS ON S.ID_TIPO_SOLICITUD = TS.ID_TIPO_SOLICITUD
        JOIN ${QUESTION_TABLE} P ON SP.ID_PREGUNTA = P.ID_PREGUNTA
        JOIN ${RESPONSE_TYPE_TABLE} TR ON P.ID_TIPO_RESPUESTA = TR.ID_TIPO_RESPUESTA
        JOIN ${STATE_TABLE} E ON SP.ID_ESTADO = E.ID_ESTADO
        WHERE SP.ID_SOLICITUD = :idSolicitud
          AND SP.ID_PREGUNTA = :idPregunta
      `,
            { idSolicitud, idPregunta },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return result.rows?.[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveResponsesByAssignment(idSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            `
        SELECT COUNT(*) AS TOTAL
        FROM ${RESPONSE_TABLE}
        WHERE ID_SOLICITUD = :idSolicitud
          AND ID_PREGUNTA = :idPregunta
          AND ID_ESTADO = 1
      `,
            { idSolicitud, idPregunta },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return Number(result.rows?.[0]?.TOTAL || 0);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createRequestQuestion(requestQuestionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_PREGUNTA_INSERT_SP(
          :idSolicitud,
          :idPregunta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSolicitud: requestQuestionData.idSolicitud,
                idPregunta: requestQuestionData.idPregunta,
                idEstado: requestQuestionData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateRequestQuestion(requestQuestionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_PREGUNTA_UPDATE_SP(
          :idSolicitud,
          :idPregunta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSolicitud: requestQuestionData.idSolicitud,
                idPregunta: requestQuestionData.idPregunta,
                idEstado: requestQuestionData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteRequestQuestion(idSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_PREGUNTA_DELETE_SP(
          :idSolicitud,
          :idPregunta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idSolicitud, idPregunta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllRequestQuestionsForAdmin,
    findRequestQuestionByPk,
    countActiveResponsesByAssignment,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion
};
