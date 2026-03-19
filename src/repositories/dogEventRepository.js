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

function normalizeDetailText(value) {
    return String(value || '').trim();
}

function normalizeAmount(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function dogEventMatchesPayload(dogEvent, dogEventData) {
    return (
        Number(dogEvent.ID_PERRITO) === Number(dogEventData.idPerrito) &&
        Number(dogEvent.ID_TIPO_EVENTO) === Number(dogEventData.idTipoEvento) &&
        normalizeDateOnly(dogEvent.FECHA_EVENTO) === normalizeDateOnly(dogEventData.fechaEvento) &&
        normalizeDetailText(dogEvent.DETALLE) === normalizeDetailText(dogEventData.detalle) &&
        normalizeAmount(dogEvent.TOTAL_GASTO) === normalizeAmount(dogEventData.totalGasto) &&
        Number(dogEvent.ID_ESTADO) === Number(dogEventData.idEstado)
    );
}

async function findCreatedDogEventByPackage(connection, dogEventData, existingEventIds) {
    const dogEventsAfterInsert = await executeCursorFunctionWithConnection(
        connection,
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVENTOS_PERRITO_FN()'
    );

    const newDogEvents = dogEventsAfterInsert.filter(
        (dogEvent) => !existingEventIds.has(Number(dogEvent.ID_EVENTO))
    );

    const matchingDogEvents = newDogEvents.filter((dogEvent) =>
        dogEventMatchesPayload(dogEvent, dogEventData)
    );

    if (matchingDogEvents.length > 0) {
        return matchingDogEvents[0];
    }

    return newDogEvents[0] || null;
}

async function findAllDogEvents() {
    return executeCursorFunction('KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVENTOS_PERRITO_FN()');
}

async function findDogEventById(idEvento) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVENTO_PERRITO_POR_ID_FN(:idEvento)',
        { idEvento }
    );

    return rows[0] || null;
}

async function countActiveDetailsByEvent(idEvento) {
    const details = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLES_EVENTO_FN(:idEvento)',
        { idEvento }
    );

    return details.filter((detail) => Number(detail.ID_ESTADO) === 1).length;
}

async function createDogEvent(dogEventData) {
    let connection;

    try {
        connection = await getConnection();
        const existingDogEvents = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_EVENTOS_PERRITO_FN()'
        );
        const existingEventIds = new Set(
            existingDogEvents.map((dogEvent) => Number(dogEvent.ID_EVENTO))
        );

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVENTO_PERRITO_INSERT_SP(
          :idPerrito,
          :idTipoEvento,
          :fechaEvento,
          :detalle,
          :totalGasto,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idPerrito: dogEventData.idPerrito,
                idTipoEvento: dogEventData.idTipoEvento,
                fechaEvento: dogEventData.fechaEvento,
                detalle: dogEventData.detalle,
                totalGasto: dogEventData.totalGasto,
                idEstado: dogEventData.idEstado
            },
            { autoCommit: true }
        );

        const createdDogEvent = await findCreatedDogEventByPackage(
            connection,
            dogEventData,
            existingEventIds
        );

        if (!createdDogEvent?.ID_EVENTO) {
            throw new Error('No fue posible obtener el evento del perrito creado desde el package.');
        }

        return { idEvento: createdDogEvent.ID_EVENTO };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateDogEvent(dogEventData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVENTO_PERRITO_UPDATE_SP(
          :idEvento,
          :idPerrito,
          :idTipoEvento,
          :fechaEvento,
          :detalle,
          :totalGasto,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idEvento: dogEventData.idEvento,
                idPerrito: dogEventData.idPerrito,
                idTipoEvento: dogEventData.idTipoEvento,
                fechaEvento: dogEventData.fechaEvento,
                detalle: dogEventData.detalle,
                totalGasto: dogEventData.totalGasto,
                idEstado: dogEventData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteDogEvent(idEvento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_EVENTO_PERRITO_DELETE_SP(
          :idEvento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idEvento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllDogEvents,
    findDogEventById,
    countActiveDetailsByEvent,
    createDogEvent,
    updateDogEvent,
    deleteDogEvent
};
