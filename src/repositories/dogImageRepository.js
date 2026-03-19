const oracledb = require('oracledb');
const { getConnection } = require('../config/db');
const { OUT_CURSOR_BIND_NAME, fetchRowsFromCursor } = require('./repositoryUtils');

async function executeCursorFunction(functionCall, binds = {}) {
    let connection;

    try {
        connection = await getConnection();
        return await executeCursorFunctionWithConnection(connection, functionCall, binds);
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function executeCursorFunctionWithConnection(connection, functionCall, binds = {}) {
    const sql = `
      BEGIN
        :${OUT_CURSOR_BIND_NAME} := ${functionCall};
      END;
    `;

    const result = await connection.execute(
        sql,
        {
            ...binds,
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
}

async function findDogImagesByDogId(idPerrito) {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(:idPerrito)',
        { idPerrito }
    );
}

async function findDogImageById(idImagen) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGEN_PERRO_POR_ID_FN(:idImagen)',
        { idImagen }
    );

    return rows[0] || null;
}

function dogImageMatchesPayload(dogImage, dogImageData) {
    return (
        Number(dogImage.ID_PERRITO) === Number(dogImageData.idPerrito) &&
        String(dogImage.IMAGE_URL || '').trim() === String(dogImageData.imageUrl || '').trim() &&
        Number(dogImage.ID_ESTADO) === Number(dogImageData.idEstado)
    );
}

async function findCreatedDogImageByPackage(connection, dogImageData, existingImageIds) {
    const dogImagesAfterInsert = await executeCursorFunctionWithConnection(
        connection,
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(:idPerrito)',
        { idPerrito: dogImageData.idPerrito }
    );

    const newDogImages = dogImagesAfterInsert.filter(
        (dogImage) => !existingImageIds.has(Number(dogImage.ID_IMAGEN))
    );

    const matchingDogImages = newDogImages.filter((dogImage) =>
        dogImageMatchesPayload(dogImage, dogImageData)
    );

    if (matchingDogImages.length > 0) {
        return matchingDogImages[0];
    }

    return newDogImages[0] || null;
}

async function createDogImage(dogImageData) {
    let connection;

    try {
        connection = await getConnection();
        const existingDogImages = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(:idPerrito)',
            { idPerrito: dogImageData.idPerrito }
        );
        const existingImageIds = new Set(
            existingDogImages.map((dogImage) => Number(dogImage.ID_IMAGEN))
        );

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_IMAGEN_INSERT_SP(
          :idPerrito,
          :imageUrl,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPerrito: dogImageData.idPerrito,
                imageUrl: dogImageData.imageUrl,
                idEstado: dogImageData.idEstado
            },
            { autoCommit: true }
        );

        const createdDogImage = await findCreatedDogImageByPackage(
            connection,
            dogImageData,
            existingImageIds
        );

        if (!createdDogImage?.ID_IMAGEN) {
            throw new Error('No fue posible obtener la imagen del perrito creada desde el package.');
        }

        return { idImagen: createdDogImage.ID_IMAGEN };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDogImage(dogImageData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_IMAGEN_UPDATE_SP(
          :idImagen,
          :idPerrito,
          :imageUrl,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idImagen: dogImageData.idImagen,
                idPerrito: dogImageData.idPerrito,
                imageUrl: dogImageData.imageUrl,
                idEstado: dogImageData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDogImage(idImagen) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_IMAGEN_DELETE_SP(
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
    findDogImagesByDogId,
    findDogImageById,
    createDogImage,
    updateDogImage,
    deleteDogImage
};
