const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllCategoriesForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CATEGORIAS_ADMIN_FN();
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

async function findCategoryById(idCategoria) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_CATEGORIA_POR_ID_FN(
          :idCategoria
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idCategoria,
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

async function countActiveProductsByCategory(idCategoria) {
    let connection;

    try {
        connection = await getConnection();
        const result = await connection.execute(
            `
                SELECT COUNT(*) AS TOTAL
                FROM FIDE_PRODUCTO_TB
                WHERE ID_CATEGORIA = :idCategoria
                  AND ID_ESTADO = 1
            `,
            { idCategoria },
            { outFormat: oracledb.OUT_FORMAT_OBJECT }
        );

        return Number(result.rows?.[0]?.TOTAL || 0);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function createCategory(categoryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CATEGORIA_INSERT_SP(
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: categoryData.nombre,
                idEstado: categoryData.idEstado
            },
            { autoCommit: true }
        );

        const idCategoria = await getCurrentSequenceValue(connection, 'FIDE_CATEGORIA_SEQ');
        if (!idCategoria) {
            throw new Error('No fue posible obtener la categoria creada desde el package.');
        }

        return { idCategoria };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateCategory(categoryData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CATEGORIA_UPDATE_SP(
          :idCategoria,
          :nombre,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idCategoria: categoryData.idCategoria,
                nombre: categoryData.nombre,
                idEstado: categoryData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteCategory(idCategoria) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_CATEGORIA_DELETE_SP(
          :idCategoria
        );
      END;
    `;

        await connection.execute(
            sql,
            { idCategoria },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllCategoriesForAdmin,
    findCategoryById,
    countActiveProductsByCategory,
    createCategory,
    updateCategory,
    deleteCategory
};
