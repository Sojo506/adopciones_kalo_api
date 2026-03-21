const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

async function findAllRequestQuestionsForAdmin() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_SOLICITUD_PREGUNTA_ADMIN_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findRequestQuestionByPk(idTipoSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_SOLICITUD_PREGUNTA_ADMIN_POR_PK_FN(:idTipoSolicitud, :idPregunta)',
            { idTipoSolicitud, idPregunta }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findActiveQuestionsByRequestType(idTipoSolicitud) {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PREGUNTAS_POR_TIPO_SOLICITUD_FN(:idTipoSolicitud)',
            { idTipoSolicitud }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveResponsesByAssignment(idTipoSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();
        const requests = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_FN()'
        );
        const activeRequestIds = new Set(
            requests
                .filter(
                    (request) =>
                        Number(request.ID_TIPO_SOLICITUD) === Number(idTipoSolicitud) &&
                        Number(request.ID_ESTADO) === 1
                )
                .map((request) => Number(request.ID_SOLICITUD))
        );

        if (activeRequestIds.size === 0) {
            return 0;
        }

        const responses = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_ADMIN_FN()'
        );
        return responses.filter(
            (response) =>
                activeRequestIds.has(Number(response.ID_SOLICITUD)) &&
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
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_PREGUNTA_INSERT_SP(
          :idTipoSolicitud,
          :idPregunta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoSolicitud: requestQuestionData.idTipoSolicitud,
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
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_PREGUNTA_UPDATE_SP(
          :idTipoSolicitud,
          :idPregunta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoSolicitud: requestQuestionData.idTipoSolicitud,
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

async function deleteRequestQuestion(idTipoSolicitud, idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_PREGUNTA_DELETE_SP(
          :idTipoSolicitud,
          :idPregunta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoSolicitud, idPregunta },
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
    findActiveQuestionsByRequestType,
    countActiveResponsesByAssignment,
    createRequestQuestion,
    updateRequestQuestion,
    deleteRequestQuestion
};
