const { getConnection } = require('../config/db');
const { executeCursorFunctionWithConnection } = require('./repositoryUtils');

const PACKAGE_NAME = 'KALO.FIDE_KALO_PKG';

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

async function findAdminDashboardSummary() {
    const rows = await executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_RESUMEN_ADMIN_DASHBOARD_FN()`
    );

    return rows[0] || null;
}

async function findInvoiceReport() {
    return executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_REPORTE_FACTURAS_ADMIN_FN()`
    );
}

async function findDonationReport() {
    return executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_REPORTE_DONACIONES_ADMIN_FN()`
    );
}

async function findAdoptionReport() {
    return executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_REPORTE_ADOPCIONES_ADMIN_FN()`
    );
}

async function findLowInventoryReport(stockThreshold) {
    return executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_REPORTE_INVENTARIO_BAJO_FN(:stockThreshold)`,
        { stockThreshold }
    );
}

async function findFollowUpAlerts() {
    return executeCursorFunction(
        `${PACKAGE_NAME}.FIDE_ALERTAS_SEGUIMIENTO_ADMIN_FN()`
    );
}

module.exports = {
    findAdminDashboardSummary,
    findInvoiceReport,
    findDonationReport,
    findAdoptionReport,
    findLowInventoryReport,
    findFollowUpAlerts
};
