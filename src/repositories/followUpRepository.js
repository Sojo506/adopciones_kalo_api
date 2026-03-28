const { getConnection } = require('../config/db');
const {
    executeCursorFunctionWithConnection,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllFollowUpsForAdmin() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SEGUIMIENTOS_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findFollowUpById(idSeguimiento) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SEGUIMIENTO_POR_ID_FN(:idSeguimiento)',
            { idSeguimiento }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveEvidencesByFollowUp(idSeguimiento) {
    let connection;

    try {
        connection = await getConnection();
        const evidences = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVIDENCIAS_POR_SEGUIMIENTO_FN(:idSeguimiento)',
            { idSeguimiento }
        );
        return evidences.filter((evidence) => Number(evidence.ID_ESTADO) === 1).length;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createFollowUp(followUpData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SEGUIMIENTO_INSERT_SP(
          :idAdopcion,
          :idTipoSeguimiento,
          :fechaInicio,
          :fechaFin,
          :comentarios,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idAdopcion: followUpData.idAdopcion,
                idTipoSeguimiento: followUpData.idTipoSeguimiento,
                fechaInicio: followUpData.fechaInicio,
                fechaFin: followUpData.fechaFin,
                comentarios: followUpData.comentarios,
                idEstado: followUpData.idEstado
            },
            { autoCommit: true }
        );

        const idSeguimiento = await getCurrentSequenceValue(connection, 'FIDE_SEGUIMIENTO_SEQ');

        if (!idSeguimiento) {
            throw new Error('No fue posible obtener el seguimiento creado desde el package.');
        }

        return { idSeguimiento };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateFollowUp(followUpData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SEGUIMIENTO_UPDATE_SP(
          :idSeguimiento,
          :idAdopcion,
          :idTipoSeguimiento,
          :fechaInicio,
          :fechaFin,
          :comentarios,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSeguimiento: followUpData.idSeguimiento,
                idAdopcion: followUpData.idAdopcion,
                idTipoSeguimiento: followUpData.idTipoSeguimiento,
                fechaInicio: followUpData.fechaInicio,
                fechaFin: followUpData.fechaFin,
                comentarios: followUpData.comentarios,
                idEstado: followUpData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteFollowUp(idSeguimiento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_SEGUIMIENTO_DELETE_SP(
          :idSeguimiento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idSeguimiento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllFollowUpsForAdmin,
    findFollowUpById,
    countActiveEvidencesByFollowUp,
    createFollowUp,
    updateFollowUp,
    deleteFollowUp
};
