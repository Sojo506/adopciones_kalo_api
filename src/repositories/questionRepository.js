const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    executeCursorFunctionWithConnection,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllQuestionsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PREGUNTAS_ADMIN_FN();
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

async function findQuestionById(idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PREGUNTA_POR_ID_FN(
          :idPregunta
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idPregunta,
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

async function countActiveResponsesByQuestion(idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_FN();
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
            const responses = await fetchRowsFromCursor(resultSet);

            return responses.filter(
                (response) =>
                    Number(response.ID_PREGUNTA) === Number(idPregunta) &&
                    Number(response.ID_ESTADO) === 1
            ).length;
        } finally {
            await resultSet.close();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveAssignmentsByQuestion(idPregunta) {
    let connection;

    try {
        connection = await getConnection();
        const requestTypes = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_SOLICITUD_ADMIN_FN()'
        );
        const activeRequestTypeIds = new Set(
            requestTypes
                .filter((requestType) => Number(requestType.ID_ESTADO) === 1)
                .map((requestType) => Number(requestType.ID_TIPO_SOLICITUD))
        );
        const requestQuestions = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_SOLICITUD_PREGUNTA_ADMIN_FN()'
        );

        return requestQuestions.filter(
            (requestQuestion) =>
                Number(requestQuestion.ID_PREGUNTA) === Number(idPregunta) &&
                Number(requestQuestion.ID_ESTADO) === 1 &&
                activeRequestTypeIds.has(Number(requestQuestion.ID_TIPO_SOLICITUD))
        ).length;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createQuestion(questionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PREGUNTA_INSERT_SP(
          :pregunta,
          :idTipoRespuesta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                pregunta: questionData.pregunta,
                idTipoRespuesta: questionData.idTipoRespuesta,
                idEstado: questionData.idEstado
            },
            { autoCommit: true }
        );

        const idPregunta = await getCurrentSequenceValue(connection, 'FIDE_PREGUNTA_SEQ');

        if (!idPregunta) {
            throw new Error('No fue posible obtener la pregunta creada desde el package.');
        }

        return { idPregunta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateQuestion(questionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PREGUNTA_UPDATE_SP(
          :idPregunta,
          :pregunta,
          :idTipoRespuesta,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPregunta: questionData.idPregunta,
                pregunta: questionData.pregunta,
                idTipoRespuesta: questionData.idTipoRespuesta,
                idEstado: questionData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteQuestion(idPregunta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PREGUNTA_DELETE_SP(
          :idPregunta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idPregunta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllQuestionsForAdmin,
    findQuestionById,
    countActiveResponsesByQuestion,
    countActiveAssignmentsByQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion
};
