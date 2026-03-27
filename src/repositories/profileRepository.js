const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

const PACKAGE_NAME = 'KALO.FIDE_KALO_PKG';

async function executeProfileCursorFunction(connection, functionCall, binds = {}) {
    return executeCursorFunctionWithConnection(connection, functionCall, binds);
}

async function findProfileOverviewData(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        const profileRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_RESUMEN_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const requestRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_SOLICITUDES_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const purchaseRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_COMPRAS_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const purchaseItemRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_PRODUCTOS_COMPRA_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const purchaseInvoiceRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_FACTURAS_COMPRA_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const fosterHomeRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_CASAS_CUNA_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
        const fosterDogRows = await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_PERRITOS_CASA_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );

        return {
            profile: profileRows[0] || null,
            requests: requestRows,
            purchases: purchaseRows,
            purchaseItems: purchaseItemRows,
            purchaseInvoices: purchaseInvoiceRows,
            fosterHomes: fosterHomeRows,
            fosterDogs: fosterDogRows
        };
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

async function findProfileFollowUpsData(idCuenta) {
    let connection;

    try {
        connection = await getConnection();

        return await executeProfileCursorFunction(
            connection,
            `${PACKAGE_NAME}.FIDE_OBTENER_SEGUIMIENTOS_PERFIL_CUENTA_FN(:idCuenta)`,
            { idCuenta }
        );
    } finally {
        if (connection) {
            await connection.close();
        }
    }
}

module.exports = {
    findProfileOverviewData,
    findProfileFollowUpsData
};
