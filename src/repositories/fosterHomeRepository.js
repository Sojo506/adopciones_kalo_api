const { getConnection } = require('../config/db');
const {
    executeCursorFunctionWithConnection,
    getCurrentSequenceValue
} = require('./repositoryUtils');

function normalizeOptionalForeignKey(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

async function findAllFosterHomes() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_CUNA_ADMIN_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findFosterHomeById(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASA_CUNA_ADMIN_POR_ID_FN(:idCasaCuna)',
            { idCasaCuna }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findFosterHomeByRequestId(idSolicitud, { excludeId = null } = {}) {
    if (idSolicitud === undefined || idSolicitud === null || idSolicitud === '') {
        return null;
    }

    let connection;

    try {
        connection = await getConnection();
        const fosterHomes = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_CUNA_ADMIN_FN()'
        );
        return (
            fosterHomes.find(
                (fosterHome) =>
                    Number(fosterHome.ID_SOLICITUD) === Number(idSolicitud) &&
                    (excludeId === null ||
                        excludeId === undefined ||
                        Number(fosterHome.ID_CASA_CUNA) !== Number(excludeId))
            ) || null
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function countActiveDogAssignmentsByFosterHome(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();
        const houseDogs = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_PERRITO_ADMIN_FN()'
        );
        return houseDogs.filter(
            (houseDog) =>
                Number(houseDog.ID_CASA_CUNA) === Number(idCasaCuna) &&
                Number(houseDog.ID_ESTADO) === 1
        ).length;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createFosterHome(fosterHomeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_INSERT_SP(
          :nombre,
          :idDireccion,
          :identificacion,
          :idSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: fosterHomeData.nombre,
                idDireccion: fosterHomeData.idDireccion,
                identificacion: fosterHomeData.identificacion,
                idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
                idEstado: fosterHomeData.idEstado
            },
            { autoCommit: true }
        );

        const idCasaCuna = await getCurrentSequenceValue(connection, 'FIDE_CASA_CUNA_SEQ');

        if (!idCasaCuna) {
            throw new Error('No fue posible obtener la casa cuna creada desde el package.');
        }

        return { idCasaCuna };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateFosterHome(fosterHomeData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_UPDATE_SP(
          :idCasaCuna,
          :nombre,
          :idDireccion,
          :identificacion,
          :idSolicitud,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCasaCuna: fosterHomeData.idCasaCuna,
                nombre: fosterHomeData.nombre,
                idDireccion: fosterHomeData.idDireccion,
                identificacion: fosterHomeData.identificacion,
                idSolicitud: normalizeOptionalForeignKey(fosterHomeData.idSolicitud),
                idEstado: fosterHomeData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteFosterHome(idCasaCuna) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_CUNA_DELETE_SP(
          :idCasaCuna
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCasaCuna },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllFosterHomes,
    findFosterHomeById,
    findFosterHomeByRequestId,
    countActiveDogAssignmentsByFosterHome,
    createFosterHome,
    updateFosterHome,
    deleteFosterHome
};
