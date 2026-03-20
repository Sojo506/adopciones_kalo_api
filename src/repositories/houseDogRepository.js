const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

async function findAllHouseDogsForAdmin() {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_PERRITO_ADMIN_FN()'
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findHouseDogByPk(idCasaCuna, idPerrito) {
    let connection;

    try {
        connection = await getConnection();
        const rows = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASA_PERRITO_ADMIN_POR_PK_FN(:idCasaCuna, :idPerrito)',
            { idCasaCuna, idPerrito }
        );
        return rows[0] || null;
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findActiveHouseDogByDogId(
    idPerrito,
    { excludeIdCasaCuna = null, excludeIdPerrito = null } = {}
) {
    let connection;

    try {
        connection = await getConnection();
        const houseDogs = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_PERRITO_ADMIN_FN()'
        );
        return (
            houseDogs.find(
                (houseDog) =>
                    Number(houseDog.ID_PERRITO) === Number(idPerrito) &&
                    Number(houseDog.ID_ESTADO) === 1 &&
                    !(
                        excludeIdCasaCuna !== null &&
                        excludeIdCasaCuna !== undefined &&
                        excludeIdPerrito !== null &&
                        excludeIdPerrito !== undefined &&
                        Number(houseDog.ID_CASA_CUNA) === Number(excludeIdCasaCuna) &&
                        Number(houseDog.ID_PERRITO) === Number(excludeIdPerrito)
                    )
            ) || null
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createHouseDog(houseDogData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_PERRITO_INSERT_SP(
          :idCasaCuna,
          :idPerrito,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCasaCuna: houseDogData.idCasaCuna,
                idPerrito: houseDogData.idPerrito,
                idEstado: houseDogData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateHouseDog(houseDogData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_PERRITO_UPDATE_SP(
          :idCasaCuna,
          :idPerrito,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCasaCuna: houseDogData.idCasaCuna,
                idPerrito: houseDogData.idPerrito,
                idEstado: houseDogData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteHouseDog(idCasaCuna, idPerrito) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CASA_PERRITO_DELETE_SP(
          :idCasaCuna,
          :idPerrito
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCasaCuna, idPerrito },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllHouseDogsForAdmin,
    findHouseDogByPk,
    findActiveHouseDogByDogId,
    createHouseDog,
    updateHouseDog,
    deleteHouseDog
};
