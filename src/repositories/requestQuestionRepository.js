const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

async function findAllRequestQuestionsForAdmin() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_PREGUNTA_ADMIN_FN()'
        );
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
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUD_PREGUNTA_ADMIN_POR_PK_FN(:idSolicitud, :idPregunta)',
            { idSolicitud, idPregunta }
        );
        return rows[0] || null;
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
        const responses = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_POR_SOLICITUD_FN(:idSolicitud)',
            { idSolicitud }
        );
        return responses.filter(
            (response) =>
                Number(response.ID_PREGUNTA) === Number(idPregunta) &&
                Number(response.ID_ESTADO) === 1
        ).length;
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
