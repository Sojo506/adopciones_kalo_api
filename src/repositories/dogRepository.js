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

function normalizeDogId(value) {
    return Number(value);
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

function dogMatchesPayload(dog, dogData) {
    return (
        String(dog.NOMBRE || '').trim().toLowerCase() === String(dogData.nombre || '').trim().toLowerCase() &&
        normalizeDateOnly(dog.FECHA_INGRESO) === normalizeDateOnly(dogData.fechaIngreso) &&
        Number(dog.EDAD) === Number(dogData.edad) &&
        Number(dog.PESO) === Number(dogData.peso) &&
        Number(dog.ESTATURA) === Number(dogData.estatura) &&
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
        (dog) => !existingDogIds.has(normalizeDogId(dog.ID_PERRITO))
    );

    const matchingNewDogs = newDogs.filter((dog) => dogMatchesPayload(dog, dogData));

    if (matchingNewDogs.length > 0) {
        return matchingNewDogs[0];
    }

    return newDogs[0] || null;
}

async function findAllDogsForAdmin() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRITOS_FN()');
}

async function findDogById(idPerrito) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_PERRO_POR_ID_FN(:idPerrito)',
        { idPerrito }
    );

    return rows[0] || null;
}

async function getActiveDependencySummaryByDog(idPerrito) {
    let connection;

    try {
        connection = await getConnection();

        const images = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_IMAGENES_PERRO_FN(:idPerrito)',
            { idPerrito }
        );
        const events = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_HISTORIAL_MEDICO_PERRITO_FN(:idPerrito)',
            { idPerrito }
        );
        const requests = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_SOLICITUDES_FN()'
        );
        const houseAssignments = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_CASAS_PERRITO_FN()'
        );

        return {
            activeImages: images.filter((image) => Number(image.ID_ESTADO) === 1).length,
            activeEvents: events.filter((event) => Number(event.ID_ESTADO) === 1).length,
            activeRequests: requests.filter(
                (request) =>
                    Number(request.ID_PERRITO) === Number(idPerrito) &&
                    Number(request.ID_ESTADO) === 1
            ).length,
            activeHouseAssignments: houseAssignments.filter(
                (assignment) =>
                    Number(assignment.ID_PERRITO) === Number(idPerrito) &&
                    Number(assignment.ID_ESTADO) === 1
            ).length
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
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
            existingDogs.map((dog) => normalizeDogId(dog.ID_PERRITO))
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

        const createdDog = await findCreatedDogByPackage(connection, dogData, existingDogIds);

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
    findAllDogsForAdmin,
    findDogById,
    getActiveDependencySummaryByDog,
    createDog,
    updateDog,
    deleteDog
};
