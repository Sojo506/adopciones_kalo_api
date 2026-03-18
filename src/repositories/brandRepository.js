const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllBrandsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_MARCAS_ADMIN_FN();
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

async function findBrandById(idMarca) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_MARCA_POR_ID_FN(
          :idMarca
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idMarca,
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

async function countActiveProductsByBrand(idMarca) {
    let connection;

    try {
        connection = await getConnection();
        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PRODUCTOS_FN();
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
            const products = await fetchRowsFromCursor(resultSet);

            return products.filter(
                (product) => Number(product.ID_MARCA) === Number(idMarca)
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

async function createBrand(brandData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MARCA_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: brandData.nombre,
                idEstado: brandData.idEstado
            },
            { autoCommit: true }
        );

        const idMarca = await getCurrentSequenceValue(connection, 'FIDE_MARCA_SEQ');
        if (!idMarca) {
            throw new Error('No fue posible obtener la marca creada desde el package.');
        }

        return { idMarca };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateBrand(brandData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MARCA_UPDATE_SP(
          :idMarca,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idMarca: brandData.idMarca,
                nombre: brandData.nombre,
                idEstado: brandData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteBrand(idMarca) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_MARCA_DELETE_SP(
          :idMarca
        );
      END;
    `;

        await connection.execute(
            sql,
            { idMarca },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllBrandsForAdmin,
    findBrandById,
    countActiveProductsByBrand,
    createBrand,
    updateBrand,
    deleteBrand
};
