const { getConnection } = require('../config/db');
const {
    executeCursorFunctionWithConnection,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllEvidences() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVIDENCIAS_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findEvidencesByFollowUpId(idSeguimiento) {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVIDENCIAS_POR_SEGUIMIENTO_FN(:idSeguimiento)',
            { idSeguimiento }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findEvidenceById(idEvidencia) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVIDENCIA_POR_ID_FN(:idEvidencia)',
            { idEvidencia }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findEvidencesByAccountId(idCuenta) {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVIDENCIAS_PERFIL_CUENTA_FN(:idCuenta)',
            { idCuenta }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createEvidence(evidenceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVIDENCIA_INSERT_SP(
          :idSeguimiento,
          :imageUrl,
          :comentarios,
          :fechaEvidencia,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idSeguimiento: evidenceData.idSeguimiento,
                imageUrl: evidenceData.imageUrl,
                comentarios: evidenceData.comentarios,
                fechaEvidencia: evidenceData.fechaEvidencia,
                idEstado: evidenceData.idEstado
            },
            { autoCommit: true }
        );

        const idEvidencia = await getCurrentSequenceValue(connection, 'FIDE_EVIDENCIA_SEQ');

        if (!idEvidencia) {
            throw new Error('No fue posible obtener la evidencia creada desde el package.');
        }

        return { idEvidencia };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateEvidence(evidenceData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVIDENCIA_UPDATE_SP(
          :idEvidencia,
          :idSeguimiento,
          :imageUrl,
          :comentarios,
          :fechaEvidencia,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idEvidencia: evidenceData.idEvidencia,
                idSeguimiento: evidenceData.idSeguimiento,
                imageUrl: evidenceData.imageUrl,
                comentarios: evidenceData.comentarios,
                fechaEvidencia: evidenceData.fechaEvidencia,
                idEstado: evidenceData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteEvidence(idEvidencia) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVIDENCIA_DELETE_SP(
          :idEvidencia
        );
      END;
    `;

        await connection.execute(
            sql,
            { idEvidencia },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllEvidences,
    findEvidencesByFollowUpId,
    findEvidenceById,
    findEvidencesByAccountId,
    createEvidence,
    updateEvidence,
    deleteEvidence
};
