const { getConnection } = require('../config/db');
const {
    executeCursorFunctionWithConnection,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllAdoptions() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCIONES_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findAdoptionById(idAdopcion) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCION_POR_ID_FN(:idAdopcion)',
            { idAdopcion }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findAdoptionByRequestId(idSolicitud, { excludeId = null } = {}) {
    let connection;

    try {
        connection = await getConnection();
        const adoptions = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCIONES_FN()'
        );
        return (
            adoptions.find(
                (adoption) =>
                    Number(adoption.ID_SOLICITUD) === Number(idSolicitud) &&
                    (excludeId === null ||
                        excludeId === undefined ||
                        Number(adoption.ID_ADOPCION) !== Number(excludeId))
            ) || null
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findActiveAdoptionByDogId(idPerrito, { excludeId = null } = {}) {
    let connection;

    try {
        connection = await getConnection();
        const adoptions = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_ADOPCIONES_FN()'
        );
        return (
            adoptions.find(
                (adoption) =>
                    Number(adoption.ID_PERRITO) === Number(idPerrito) &&
                    Number(adoption.ID_ESTADO) === 1 &&
                    (excludeId === null ||
                        excludeId === undefined ||
                        Number(adoption.ID_ADOPCION) !== Number(excludeId))
            ) || null
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveFollowUpsByAdoption(idAdopcion) {
    let connection;

    try {
        connection = await getConnection();
        const followUps = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SEGUIMIENTOS_POR_ADOPCION_FN(:idAdopcion)',
            { idAdopcion }
        );
        return followUps.filter((followUp) => Number(followUp.ID_ESTADO) === 1).length;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createAdoption(adoptionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ADOPCION_INSERT_SP(
          :identificacion,
          :idPerrito,
          :idSolicitud,
          :fechaAdopcion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                identificacion: adoptionData.identificacion,
                idPerrito: adoptionData.idPerrito,
                idSolicitud: adoptionData.idSolicitud,
                fechaAdopcion: adoptionData.fechaAdopcion,
                idEstado: adoptionData.idEstado
            },
            { autoCommit: true }
        );

        const idAdopcion = await getCurrentSequenceValue(connection, 'FIDE_ADOPCION_SEQ');

        if (!idAdopcion) {
            throw new Error('No fue posible obtener la adopción creada desde el package.');
        }

        return { idAdopcion };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateAdoption(adoptionData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ADOPCION_UPDATE_SP(
          :idAdopcion,
          :identificacion,
          :idPerrito,
          :idSolicitud,
          :fechaAdopcion,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idAdopcion: adoptionData.idAdopcion,
                identificacion: adoptionData.identificacion,
                idPerrito: adoptionData.idPerrito,
                idSolicitud: adoptionData.idSolicitud,
                fechaAdopcion: adoptionData.fechaAdopcion,
                idEstado: adoptionData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteAdoption(idAdopcion) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_ADOPCION_DELETE_SP(
          :idAdopcion
        );
      END;
    `;

        await connection.execute(
            sql,
            { idAdopcion },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllAdoptions,
    findAdoptionById,
    findAdoptionByRequestId,
    findActiveAdoptionByDogId,
    countActiveFollowUpsByAdoption,
    createAdoption,
    updateAdoption,
    deleteAdoption
};
