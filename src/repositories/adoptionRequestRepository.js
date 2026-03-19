const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function executeCursorQuery(sql, binds = {}) {
    let connection;

    try {
        connection = await getConnection();

        const result = await connection.execute(
            sql,
            {
                ...binds,
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

async function findAllRequests() {
    return executeCursorQuery(`
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_FN();
      END;
    `);
}

async function findAllAdoptions() {
    return executeCursorQuery(`
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCIONES_FN();
      END;
    `);
}

async function findApplicantEligibility(identificacion) {
    const rows = await executeCursorQuery(
        `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_ELEGIBILIDAD_ADOPTANTE_FN(
          :identificacion
        );
      END;
    `,
        { identificacion }
    );

    return rows[0] || null;
}

async function createRequest(requestData) {
    let connection;

    try {
        connection = await getConnection();

        await connection.execute(
            `
          BEGIN
            KALO.FIDE_KALO_PKG.FIDE_SOLICITUD_INSERT_SP(
              :identificacion,
              :idPerrito,
              :idTipoSolicitud,
              :idEstado
            );
          END;
        `,
            {
                identificacion: requestData.identificacion,
                idPerrito: requestData.idPerrito,
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

async function createResponse(responseData) {
    let connection;

    try {
        connection = await getConnection();

        await connection.execute(
            `
          BEGIN
            KALO.FIDE_KALO_PKG.FIDE_RESPUESTA_INSERT_SP(
              :idSolicitud,
              :idPregunta,
              :respuesta,
              :idEstado
            );
          END;
        `,
            {
                idSolicitud: responseData.idSolicitud,
                idPregunta: responseData.idPregunta,
                respuesta: responseData.respuesta,
                idEstado: responseData.idEstado
            },
            { autoCommit: true }
        );

        const idRespuesta = await getCurrentSequenceValue(connection, 'FIDE_RESPUESTA_SEQ');

        return { idRespuesta };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllRequests,
    findAllAdoptions,
    findApplicantEligibility,
    createRequest,
    createResponse
};
