const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    executeCursorFunctionWithConnection,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

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
        const requestQuestions = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_PREGUNTA_ADMIN_FN()'
        );
        const responses = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_RESPUESTAS_ADMIN_FN()'
        );
        const adoptions = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCIONES_FN()'
        );
        const fosterHomes = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_CUNA_ADMIN_FN()'
        );

        return {
            activeAssignments: requestQuestions.filter(
                (requestQuestion) =>
                    Number(requestQuestion.ID_SOLICITUD) === Number(idSolicitud) &&
                    Number(requestQuestion.ID_ESTADO) === 1
            ).length,
            activeResponses: responses.filter(
                (response) =>
                    Number(response.ID_SOLICITUD) === Number(idSolicitud) &&
                    Number(response.ID_ESTADO) === 1
            ).length,
            activeAdoptions: adoptions.filter(
                (adoption) =>
                    Number(adoption.ID_SOLICITUD) === Number(idSolicitud) &&
                    Number(adoption.ID_ESTADO) === 1
            ).length,
            activeFosterHomes: fosterHomes.filter(
                (fosterHome) =>
                    Number(fosterHome.ID_SOLICITUD) === Number(idSolicitud) &&
                    Number(fosterHome.ID_ESTADO) === 1
            ).length
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
