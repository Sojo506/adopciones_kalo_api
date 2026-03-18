const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllTrackingTypesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPOS_SEGUIMIENTO_ADMIN_FN();
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

async function findTrackingTypeById(idTipoSeguimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_TIPO_SEGUIMIENTO_POR_ID_FN(
          :idTipoSeguimiento
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idTipoSeguimiento,
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

async function countActiveFollowUpsByType(idTipoSeguimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_SEGUIMIENTOS_FN();
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
            const followUps = await fetchRowsFromCursor(resultSet);

            return followUps.filter(
                (followUp) =>
                    Number(followUp.ID_TIPO_SEGUIMIENTO) === Number(idTipoSeguimiento) &&
                    Number(followUp.ID_ESTADO) === 1
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

async function createTrackingType(trackingTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SEGUIMIENTO_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: trackingTypeData.nombre,
                idEstado: trackingTypeData.idEstado
            },
            { autoCommit: true }
        );

        const idTipoSeguimiento = await getCurrentSequenceValue(
            connection,
            'FIDE_TIPO_SEGUIMIENTO_SEQ'
        );

        if (!idTipoSeguimiento) {
            throw new Error(
                'No fue posible obtener el tipo de seguimiento creado desde el package.'
            );
        }

        return { idTipoSeguimiento };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateTrackingType(trackingTypeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SEGUIMIENTO_UPDATE_SP(
          :idTipoSeguimiento,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idTipoSeguimiento: trackingTypeData.idTipoSeguimiento,
                nombre: trackingTypeData.nombre,
                idEstado: trackingTypeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteTrackingType(idTipoSeguimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_TIPO_SEGUIMIENTO_DELETE_SP(
          :idTipoSeguimiento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idTipoSeguimiento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllTrackingTypesForAdmin,
    findTrackingTypeById,
    countActiveFollowUpsByType,
    createTrackingType,
    updateTrackingType,
    deleteTrackingType
};
