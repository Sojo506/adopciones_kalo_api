const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findAllProductsForAdmin() {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PRODUCTOS_ADMIN_FN();
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

async function findProductById(idProducto) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_PRODUCTO_POR_ID_FN(
          :idProducto
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idProducto,
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

async function createProduct(productData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_INSERT_SP(
          :nombre,
          :descripcion,
          :precio,
          :idCategoria,
          :idMarca,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                precio: productData.precio,
                idCategoria: productData.idCategoria,
                idMarca: productData.idMarca,
                idEstado: productData.idEstado
            },
            { autoCommit: true }
        );

        const idProducto = await getCurrentSequenceValue(connection, 'FIDE_PRODUCTO_SEQ');

        if (!idProducto) {
            throw new Error('No fue posible obtener el producto creado desde el package.');
        }

        return { idProducto };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateProduct(productData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_UPDATE_SP(
          :idProducto,
          :nombre,
          :descripcion,
          :precio,
          :idCategoria,
          :idMarca,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idProducto: productData.idProducto,
                nombre: productData.nombre,
                descripcion: productData.descripcion,
                precio: productData.precio,
                idCategoria: productData.idCategoria,
                idMarca: productData.idMarca,
                idEstado: productData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteProduct(idProducto) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_DELETE_SP(
          :idProducto
        );
      END;
    `;

        await connection.execute(
            sql,
            { idProducto },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllProductsForAdmin,
    findProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
