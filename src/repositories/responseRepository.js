const { getConnection } = require('../config/db');
const {
    executeCursorFunctionWithConnection,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllResponsesForAdmin() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_ADMIN_FN()'
        );
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
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTA_ADMIN_POR_ID_FN(:idRespuesta)',
            { idRespuesta }
        );
        return rows[0] || null;
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
        const responses = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_POR_SOLICITUD_FN(:idSolicitud)',
            { idSolicitud }
        );
        return (
            responses.find(
                (response) =>
                    Number(response.ID_PREGUNTA) === Number(idPregunta) &&
                    (excludeId === null ||
                        excludeId === undefined ||
                        Number(response.ID_RESPUESTA) !== Number(excludeId))
            ) || null
        );
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
