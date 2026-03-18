const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllResponseTypesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_RESPUESTA_ADMIN_FN();
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

async function findResponseTypeById(idTipoRespuesta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_RESPUESTA_POR_ID_FN(
          :idTipoRespuesta
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idTipoRespuesta,
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

async function countActiveQuestionsByResponseType(idTipoRespuesta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PREGUNTAS_FN();
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
            const questions = await fetchRowsFromCursor(resultSet);

            return questions.filter(
                (question) =>
                    Number(question.ID_TIPO_RESPUESTA) === Number(idTipoRespuesta)
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

async function createResponseType(responseTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_RESPUESTA_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: responseTypeData.nombre,
                idEstado: responseTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoRespuesta = await getCurrentSequenceValue(
            connection,
            'FIDE_TIPO_RESPUESTA_SEQ'
        );

        if (!idTipoRespuesta) {
            throw new Error(
                'No fue posible obtener el tipo de respuesta creado desde el package.'
            );
        }

        return { idTipoRespuesta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateResponseType(responseTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_RESPUESTA_UPDATE_SP(
          :idTipoRespuesta,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoRespuesta: responseTypeData.idTipoRespuesta,
                nombre: responseTypeData.nombre,
                idEstado: responseTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteResponseType(idTipoRespuesta) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_RESPUESTA_DELETE_SP(
          :idTipoRespuesta
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoRespuesta },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllResponseTypesForAdmin,
    findResponseTypeById,
    countActiveQuestionsByResponseType,
    createResponseType,
    updateResponseType,
    deleteResponseType
};
