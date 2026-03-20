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

function normalizeUrl(value) {
    return String(value || '').trim();
}

function normalizeDescription(value) {
    return String(value || '').trim();
}

function normalizeAmount(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function eventDetailMatchesPayload(eventDetail, eventDetailData) {
    return (
        Number(eventDetail.ID_EVENTO) === Number(eventDetailData.idEvento) &&
        normalizeUrl(eventDetail.COMPROBANTE_URL) === normalizeUrl(eventDetailData.comprobanteUrl) &&
        normalizeDescription(eventDetail.DESCRIPCION) === normalizeDescription(eventDetailData.descripcion) &&
        normalizeAmount(eventDetail.MONTO) === normalizeAmount(eventDetailData.monto) &&
        Number(eventDetail.ID_ESTADO) === Number(eventDetailData.idEstado)
    );
}

async function findCreatedEventDetailByPackage(connection, eventDetailData, existingDetailIds) {
    const eventDetailsAfterInsert = await executeCursorFunctionWithConnection(
        connection,
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLES_EVENTO_FN(:idEvento)',
        { idEvento: eventDetailData.idEvento }
    );

    const newEventDetails = eventDetailsAfterInsert.filter(
        (eventDetail) => !existingDetailIds.has(Number(eventDetail.ID_DETALLE_EVENTO))
    );

    const matchingEventDetails = newEventDetails.filter((eventDetail) =>
        eventDetailMatchesPayload(eventDetail, eventDetailData)
    );

    if (matchingEventDetails.length > 0) {
        return matchingEventDetails[0];
    }

    return newEventDetails[0] || null;
}

async function findAllEventDetails() {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_TODOS_DETALLES_EVENTO_FN()'
    );
}

async function findEventDetailsByEvent(idEvento) {
    return executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLES_EVENTO_FN(:idEvento)',
        { idEvento }
    );
}

async function findEventDetailById(idDetalleEvento) {
    const rows = await executeCursorFunction(
        'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLE_EVENTO_POR_ID_FN(:idDetalleEvento)',
        { idDetalleEvento }
    );

    return rows[0] || null;
}

async function createEventDetail(eventDetailData) {
    let connection;

    try {
        connection = await getConnection();
        const existingEventDetails = await executeCursorFunctionWithConnection(
            connection,
            'KALO.FIDE_KALO_PKG.FIDE_OBTENER_DETALLES_EVENTO_FN(:idEvento)',
            { idEvento: eventDetailData.idEvento }
        );
        const existingDetailIds = new Set(
            existingEventDetails.map((eventDetail) => Number(eventDetail.ID_DETALLE_EVENTO))
        );

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DETALLE_EVENTO_INSERT_SP(
          :idEvento,
          :comprobanteUrl,
          :descripcion,
          :monto,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idEvento: eventDetailData.idEvento,
                comprobanteUrl: eventDetailData.comprobanteUrl,
                descripcion: eventDetailData.descripcion,
                monto: eventDetailData.monto,
                idEstado: eventDetailData.idEstado
            },
            { autoCommit: true }
        );

        const createdEventDetail = await findCreatedEventDetailByPackage(
            connection,
            eventDetailData,
            existingDetailIds
        );

        if (!createdEventDetail?.ID_DETALLE_EVENTO) {
            throw new Error(
                'No fue posible obtener el detalle de evento creado desde el package.'
            );
        }

        return { idDetalleEvento: createdEventDetail.ID_DETALLE_EVENTO };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function updateEventDetail(eventDetailData) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DETALLE_EVENTO_UPDATE_SP(
          :idDetalleEvento,
          :idEvento,
          :comprobanteUrl,
          :descripcion,
          :monto,
          :idEstado
        );
      END;
    `;

        await connection.execute(
            sql,
            {
                idDetalleEvento: eventDetailData.idDetalleEvento,
                idEvento: eventDetailData.idEvento,
                comprobanteUrl: eventDetailData.comprobanteUrl,
                descripcion: eventDetailData.descripcion,
                monto: eventDetailData.monto,
                idEstado: eventDetailData.idEstado
            },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function deleteEventDetail(idDetalleEvento) {
    let connection;

    try {
        connection = await getConnection();

        const sql = `
      BEGIN
        KALO.FIDE_KALO_PKG.FIDE_DETALLE_EVENTO_DELETE_SP(
          :idDetalleEvento
        );
      END;
    `;

        await connection.execute(
            sql,
            { idDetalleEvento },
            { autoCommit: true }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findAllEventDetails,
    findEventDetailsByEvent,
    findEventDetailById,
    createEventDetail,
    updateEventDetail,
    deleteEventDetail
};
