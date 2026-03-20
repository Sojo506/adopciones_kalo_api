const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllCampaignsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CAMPANIAS_ADMIN_FN();
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

async function findCampaignById(idCampania) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CAMPANIA_POR_ID_FN(
          :idCampania
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCampania,
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

async function countActiveDonationsByCampaign(idCampania) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_DONACIONES_POR_CAMPANIA_FN(
          :idCampania
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCampania,
                [OUT_CURSOR_BIND_NAME]: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR }
            },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        const resultSet = result.outBinds[OUT_CURSOR_BIND_NAME];

        try {
            const donations = await fetchRowsFromCursor(resultSet);
            return donations.filter((donation) => Number(donation.ID_ESTADO) === 1).length;
        } finally {
            await resultSet.close();
        }
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createCampaign(campaignData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CAMPANIA_INSERT_SP(
          :nombre,
          :descripcion,
          :imageUrl,
          :fechaInicio,
          :fechaFin,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: campaignData.nombre,
                descripcion: campaignData.descripcion,
                imageUrl: campaignData.imageUrl,
                fechaInicio: campaignData.fechaInicio,
                fechaFin: campaignData.fechaFin,
                idEstado: campaignData.idEstado
            },
            { autoCommit: true }
        );

        const idCampania = await getCurrentSequenceValue(connection, 'FIDE_CAMPANIA_SEQ');

        if (!idCampania) {
            throw new Error('No fue posible obtener la campania creada desde el package.');
        }

        return { idCampania };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateCampaign(campaignData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CAMPANIA_UPDATE_SP(
          :idCampania,
          :nombre,
          :descripcion,
          :imageUrl,
          :fechaInicio,
          :fechaFin,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCampania: campaignData.idCampania,
                nombre: campaignData.nombre,
                descripcion: campaignData.descripcion,
                imageUrl: campaignData.imageUrl,
                fechaInicio: campaignData.fechaInicio,
                fechaFin: campaignData.fechaFin,
                idEstado: campaignData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteCampaign(idCampania) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CAMPANIA_DELETE_SP(
          :idCampania
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCampania },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllCampaignsForAdmin,
    findCampaignById,
    countActiveDonationsByCampaign,
    createCampaign,
    updateCampaign,
    deleteCampaign
};
