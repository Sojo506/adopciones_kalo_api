const { getConnection } = require('../config/db');
const { getCurrentSequenceValue } = require('./repositoryUtils');

function normalizeOptionalText(value) {
    return value === undefined || value === null || value === '' ? null : value;
}

async function createAddress(addressData) {
    let connection;

    try {
        connection = await getConnection();
        const calle = normalizeOptionalText(addressData.calle);
        const numero = normalizeOptionalText(addressData.numero);

        const insertSql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DIRECCION_INSERT_SP(
          :idDistrito,
          :calle,
          :numero,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            insertSql,
            {
                idDistrito: addressData.idDistrito,
                calle,
                numero,
                idEstado: 1
            },
            { autoCommit: true }
        );

        const idDireccion = await getCurrentSequenceValue(connection, 'FIDE_DIRECCION_SEQ');
        if (!idDireccion) {
            throw new Error('No fue posible obtener el ID de la direccion creada desde el package.');
        }

        return { idDireccion };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = { createAddress };
