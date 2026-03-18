const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllRequestTypesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_SOLICITUD_ADMIN_FN();
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

async function findRequestTypeById(idTipoSolicitud) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_SOLICITUD_POR_ID_FN(
          :idTipoSolicitud
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idTipoSolicitud,
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

async function countActiveRequestsByType(idTipoSolicitud) {
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
            const requests = await fetchRowsFromCursor(resultSet);

            return requests.filter(
                (request) =>
                    Number(request.ID_TIPO_SOLICITUD) === Number(idTipoSolicitud) &&
                    Number(request.ID_ESTADO) === 1
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

async function createRequestType(requestTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: requestTypeData.nombre,
                idEstado: requestTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoSolicitud = await getCurrentSequenceValue(
            connection,
            'FIDE_TIPO_SOLICITUD_SEQ'
        );

        if (!idTipoSolicitud) {
            throw new Error(
                'No fue posible obtener el tipo de solicitud creado desde el package.'
            );
        }

        return { idTipoSolicitud };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateRequestType(requestTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_UPDATE_SP(
          :idTipoSolicitud,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoSolicitud: requestTypeData.idTipoSolicitud,
                nombre: requestTypeData.nombre,
                idEstado: requestTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteRequestType(idTipoSolicitud) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SOLICITUD_DELETE_SP(
          :idTipoSolicitud
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoSolicitud },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllRequestTypesForAdmin,
    findRequestTypeById,
    countActiveRequestsByType,
    createRequestType,
    updateRequestType,
    deleteRequestType
};
