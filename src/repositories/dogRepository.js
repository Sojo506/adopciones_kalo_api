const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

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

function normalizeDateOnly(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        return value.slice(0, 10);
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function normalizeText(value) {
    return String(value || '').trim().toLowerCase();
}

function normalizeDecimal(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    const parsedValue = Number(value);

    if (!Number.isFinite(parsedValue)) {
        return null;
    }

    return Math.round(parsedValue * 100) / 100;
}

function dogMatchesPayload(dog, dogData) {
    return (
        normalizeText(dog.NOMBRE || dog.NOMBRE_PERRITO) === normalizeText(dogData.nombre) &&
        normalizeDateOnly(dog.FECHA_INGRESO) === normalizeDateOnly(dogData.fechaIngreso) &&
        Number(dog.EDAD) === Number(dogData.edad) &&
        normalizeDecimal(dog.PESO) === normalizeDecimal(dogData.peso) &&
        normalizeDecimal(dog.ESTATURA) === normalizeDecimal(dogData.estatura) &&
        Number(dog.ID_SEXO) === Number(dogData.idSexo) &&
        Number(dog.ID_RAZA) === Number(dogData.idRaza) &&
        Number(dog.ID_ESTADO) === Number(dogData.idEstado)
    );
}

async function findCreatedDogByPackage(connection, dogData, existingDogIds) {
    const dogsAfterInsert = await executeCursorFunctionWithConnection(
        connection,
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRITOS_FN()'
    );

    const newDogs = dogsAfterInsert.filter(
        (dog) => !existingDogIds.has(Number(dog.ID_PERRITO))
    );

    const matchingDogs = newDogs.filter((dog) => dogMatchesPayload(dog, dogData));

    if (matchingDogs.length > 0) {
        return matchingDogs[0];
    }

    return newDogs[0] || null;
}

async function findAvailableDogs() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRO_DISPONIBLES_FN()');
}

async function findAllDogs() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRITOS_FN()');
}

async function findDogById(idPerrito) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRO_POR_ID_FN(:idPerrito)',
        { idPerrito }
    );

    return rows[0] || null;
}

async function findDogImages(idPerrito) {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(:idPerrito)',
        { idPerrito }
    );
}

async function createDog(dogData) {
    let connection;

    try {
        connection = await getConnection();
        const existingDogs = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRITOS_FN()'
        );
        const existingDogIds = new Set(
            existingDogs.map((dog) => Number(dog.ID_PERRITO))
        );

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_INSERT_SP(
          :nombre,
          :fechaIngreso,
          :edad,
          :peso,
          :estatura,
          :idSexo,
          :idRaza,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                nombre: dogData.nombre,
                fechaIngreso: dogData.fechaIngreso,
                edad: dogData.edad,
                peso: dogData.peso,
                estatura: dogData.estatura,
                idSexo: dogData.idSexo,
                idRaza: dogData.idRaza,
                idEstado: dogData.idEstado
            },
            { autoCommit: true }
        );

        const createdDog = await findCreatedDogByPackage(
            connection,
            dogData,
            existingDogIds
        );

        if (!createdDog?.ID_PERRITO) {
            throw new Error('No fue posible obtener el perrito creado desde el package.');
        }

        return { idPerrito: createdDog.ID_PERRITO };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDog(dogData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_UPDATE_SP(
          :idPerrito,
          :nombre,
          :edad,
          :peso,
          :estatura,
          :idSexo,
          :idRaza,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPerrito: dogData.idPerrito,
                nombre: dogData.nombre,
                edad: dogData.edad,
                peso: dogData.peso,
                estatura: dogData.estatura,
                idSexo: dogData.idSexo,
                idRaza: dogData.idRaza,
                idEstado: dogData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDog(idPerrito) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_PERRITO_DELETE_SP(
          :idPerrito
        );
      END;
    `;

        await connection.execute(
            sql,
            { idPerrito },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllDogs,
    findAvailableDogs,
    findDogById,
    findDogImages,
    createDog,
    updateDog,
    deleteDog
};
