const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const {
    OUT_CURSOR_BIND_NAME,
    fetchRowsFromCursor,
    getCurrentSequenceValue
} = require('./repositoryUtils');

async function findProductImagesByProductId(idProducto) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PRODUCTO_FN(
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

async function findProductImageById(idImagen) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGEN_PRODUCTO_POR_ID_FN(
          :idImagen
        );
      END;
    `;

        const result = await connection.execute(
            sql,
            {
                idImagen,
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

async function createProductImage(productImageData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_IMAGEN_INSERT_SP(
          :idProducto,
          :imageUrl,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idProducto: productImageData.idProducto,
                imageUrl: productImageData.imageUrl,
                idEstado: productImageData.idEstado
            },
            { autoCommit: true }
        );

        const idImagen = await getCurrentSequenceValue(connection, 'FIDE_PRODUCTO_IMAGEN_SEQ');

        if (!idImagen) {
            throw new Error('No fue posible obtener la imagen de producto creada desde el package.');
        }

        return { idImagen };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateProductImage(productImageData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_IMAGEN_UPDATE_SP(
          :idImagen,
          :idProducto,
          :imageUrl,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idImagen: productImageData.idImagen,
                idProducto: productImageData.idProducto,
                imageUrl: productImageData.imageUrl,
                idEstado: productImageData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteProductImage(idImagen) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PRODUCTO_IMAGEN_DELETE_SP(
          :idImagen
        );
      END;
    `;

        await connection.execute(
            sql,
            { idImagen },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findProductImagesByProductId,
    findProductImageById,
    createProductImage,
    updateProductImage,
    deleteProductImage
};
