const MemoryCache = require('../utils/memoryCache');
const reportRepository = require('../repositories/reportRepository');

const ADMIN_REPORT_CACHE_TTL_MS = Number(process.env.ADMIN_REPORT_CACHE_TTL_MS || 15000);
const LOW_STOCK_THRESHOLD = Number(process.env.ADMIN_LOW_STOCK_THRESHOLD || 10);

const SUMMARY_CACHE_KEY = 'admin-report:summary';
const REPORT_CACHE_PREFIX = 'admin-report:pdf:';

const reportCache = new MemoryCache({
    defaultTtlMs: ADMIN_REPORT_CACHE_TTL_MS
});

const SUPPORTED_ADMIN_REPORT_TYPES = [
    'facturas',
    'donaciones',
    'adopciones',
    'inventario-bajo'
];

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function serializeDateOnly(value) {
    if (!value) {
        return null;
    }

    if (typeof value === 'string') {
        const trimmedValue = value.trim();

        if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
            return trimmedValue;
        }

        const parsedDate = new Date(trimmedValue);

        if (Number.isNaN(parsedDate.getTime())) {
            return null;
        }

        return `${parsedDate.getUTCFullYear()}-${String(parsedDate.getUTCMonth() + 1).padStart(2, '0')}-${String(parsedDate.getUTCDate()).padStart(2, '0')}`;
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return null;
    }

    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function roundMoney(value) {
    return Math.round(Number(value || 0) * 100) / 100;
}

function toNumber(value) {
    const parsedValue = Number(value || 0);
    return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function toInteger(value) {
    return Math.trunc(toNumber(value));
}

function formatSummaryMetrics(summaryRow) {
    return {
        facturasActivas: toInteger(summaryRow.FACTURAS_ACTIVAS),
        totalFacturado: roundMoney(summaryRow.TOTAL_FACTURADO),
        ventasActivas: toInteger(summaryRow.VENTAS_ACTIVAS),
        totalVentas: roundMoney(summaryRow.TOTAL_VENTAS),
        donacionesActivas: toInteger(summaryRow.DONACIONES_ACTIVAS),
        totalDonaciones: roundMoney(summaryRow.TOTAL_DONACIONES),
        adopcionesActivas: toInteger(summaryRow.ADOPCIONES_ACTIVAS),
        perritosActivos: toInteger(summaryRow.PERRITOS_ACTIVOS),
        campaniasVigentes: toInteger(summaryRow.CAMPANIAS_VIGENTES),
        productosStockBajo: toInteger(summaryRow.PRODUCTOS_STOCK_BAJO),
        seguimientosVencidos: toInteger(summaryRow.SEGUIMIENTOS_VENCIDOS),
        seguimientosProximos: toInteger(summaryRow.SEGUIMIENTOS_PROXIMOS)
    };
}

function formatInvoiceReportRow(row) {
    return {
        idFactura: row.ID_FACTURA,
        fechaFactura: serializeDateOnly(row.FECHA_FACTURA),
        idMoneda: toInteger(row.ID_MONEDA),
        moneda: row.MONEDA || null,
        simbolo: row.SIMBOLO || null,
        subtotal: roundMoney(row.SUBTOTAL),
        impuesto: roundMoney(row.IMPUESTO),
        total: roundMoney(row.TOTAL),
        cantidadVentas: toInteger(row.CANTIDAD_VENTAS),
        cantidadDonaciones: toInteger(row.CANTIDAD_DONACIONES),
        cantidadPagosPayPal: toInteger(row.CANTIDAD_PAGOS_PAYPAL),
        idEstado: toInteger(row.ID_ESTADO),
        estado: row.ESTADO || null
    };
}

function formatDonationReportRow(row) {
    return {
        idDonacion: toInteger(row.ID_DONACION),
        fechaDonacion: serializeDateOnly(row.FECHA_DONACION),
        identificacion: row.IDENTIFICACION ? String(row.IDENTIFICACION) : null,
        donador: row.DONADOR || null,
        idCampania:
            row.ID_CAMPANIA === undefined || row.ID_CAMPANIA === null
                ? null
                : toInteger(row.ID_CAMPANIA),
        campania: row.CAMPANIA || null,
        monto: roundMoney(row.MONTO),
        cantidadFacturas: toInteger(row.CANTIDAD_FACTURAS),
        mensaje: row.MENSAJE || '',
        idEstado: toInteger(row.ID_ESTADO),
        estado: row.ESTADO || null
    };
}

function formatAdoptionReportRow(row) {
    return {
        idAdopcion: toInteger(row.ID_ADOPCION),
        fechaAdopcion: serializeDateOnly(row.FECHA_ADOPCION),
        identificacion: row.IDENTIFICACION ? String(row.IDENTIFICACION) : null,
        adoptante: row.ADOPTANTE || null,
        idSolicitud: toInteger(row.ID_SOLICITUD),
        idPerrito: toInteger(row.ID_PERRITO),
        nombrePerrito: row.NOMBRE_PERRITO || null,
        totalSeguimientos: toInteger(row.TOTAL_SEGUIMIENTOS),
        seguimientosActivos: toInteger(row.SEGUIMIENTOS_ACTIVOS),
        seguimientosVencidos: toInteger(row.SEGUIMIENTOS_VENCIDOS),
        idEstado: toInteger(row.ID_ESTADO),
        estado: row.ESTADO || null
    };
}

function formatLowInventoryReportRow(row) {
    return {
        idInventario: toInteger(row.ID_INVENTARIO),
        idProducto: toInteger(row.ID_PRODUCTO),
        producto: row.PRODUCTO || null,
        categoria: row.CATEGORIA || null,
        marca: row.MARCA || null,
        cantidad: toInteger(row.CANTIDAD),
        precio: roundMoney(row.PRECIO),
        valorEstimado: roundMoney(row.VALOR_ESTIMADO),
        idEstado: toInteger(row.ID_ESTADO),
        estado: row.ESTADO || null
    };
}

function mapFollowUpPriority(priority, daysRemaining) {
    if (priority === 'vencido') {
        return `Vencido hace ${Math.abs(daysRemaining)} dias`;
    }

    if (priority === 'vence_hoy') {
        return 'Vence hoy';
    }

    if (daysRemaining === 1) {
        return 'Vence en 1 dia';
    }

    return `Vence en ${daysRemaining} dias`;
}

function formatFollowUpAlertRow(row) {
    const daysRemaining = toInteger(row.DIAS_RESTANTES);

    return {
        idSeguimiento: toInteger(row.ID_SEGUIMIENTO),
        idAdopcion: toInteger(row.ID_ADOPCION),
        identificacion: row.IDENTIFICACION ? String(row.IDENTIFICACION) : null,
        adoptante: row.ADOPTANTE || null,
        idPerrito: toInteger(row.ID_PERRITO),
        nombrePerrito: row.NOMBRE_PERRITO || null,
        idTipoSeguimiento: toInteger(row.ID_TIPO_SEGUIMIENTO),
        tipoSeguimiento: row.TIPO_SEGUIMIENTO || null,
        fechaFin: serializeDateOnly(row.FECHA_FIN),
        cantidadEvidencias: toInteger(row.CANTIDAD_EVIDENCIAS),
        prioridad: row.PRIORIDAD || null,
        prioridadLabel: mapFollowUpPriority(row.PRIORIDAD, daysRemaining),
        diasRestantes: daysRemaining,
        idEstado: toInteger(row.ID_ESTADO),
        estado: row.ESTADO || null
    };
}

function createReportCacheKey(reportType) {
    return `${REPORT_CACHE_PREFIX}${reportType}`;
}

function buildInvoiceReportDefinition(rows) {
    const totalFacturado = rows.reduce((acc, row) => acc + row.total, 0);
    const totalVentasRelacionadas = rows.reduce((acc, row) => acc + row.cantidadVentas, 0);
    const totalDonacionesRelacionadas = rows.reduce(
        (acc, row) => acc + row.cantidadDonaciones,
        0
    );

    return {
        filename: 'reporte-facturas-admin.pdf',
        title: 'Reporte administrativo de facturas',
        subtitle: 'Consolidado financiero de facturas emitidas en el sistema.',
        columns: [
            { header: 'Fecha', key: 'fechaFactura', width: 1.2 },
            { header: 'Moneda', key: 'moneda', width: 1.5 },
            { header: 'Subtotal', key: 'subtotal', width: 1.2, align: 'right' },
            { header: 'Impuesto', key: 'impuesto', width: 1.2, align: 'right' },
            { header: 'Total', key: 'total', width: 1.2, align: 'right' },
            { header: 'Ventas', key: 'cantidadVentas', width: 0.9, align: 'right' },
            { header: 'Donaciones', key: 'cantidadDonaciones', width: 1.1, align: 'right' },
            { header: 'PayPal', key: 'cantidadPagosPayPal', width: 0.9, align: 'right' },
            { header: 'Estado', key: 'estado', width: 1.1 }
        ],
        rows,
        summary: [
            { label: 'Facturas listadas', value: rows.length },
            { label: 'Total facturado', value: roundMoney(totalFacturado) },
            { label: 'Relaciones de venta', value: totalVentasRelacionadas },
            { label: 'Relaciones de donacion', value: totalDonacionesRelacionadas }
        ]
    };
}

function buildDonationReportDefinition(rows) {
    const totalDonado = rows.reduce((acc, row) => acc + row.monto, 0);
    const totalConFactura = rows.filter((row) => row.cantidadFacturas > 0).length;

    return {
        filename: 'reporte-donaciones-admin.pdf',
        title: 'Reporte administrativo de donaciones',
        subtitle: 'Detalle de donaciones, campanias y trazabilidad de facturas relacionadas.',
        columns: [
            { header: 'Fecha', key: 'fechaDonacion', width: 1.1 },
            { header: 'Donador', key: 'donador', width: 2.5 },
            { header: 'Campania', key: 'campania', width: 2 },
            { header: 'Monto', key: 'monto', width: 1.1, align: 'right' },
            { header: 'Facturas', key: 'cantidadFacturas', width: 1, align: 'right' },
            { header: 'Estado', key: 'estado', width: 1.1 }
        ],
        rows,
        summary: [
            { label: 'Donaciones listadas', value: rows.length },
            { label: 'Monto acumulado', value: roundMoney(totalDonado) },
            { label: 'Con factura asociada', value: totalConFactura },
            { label: 'Sin factura asociada', value: rows.length - totalConFactura }
        ]
    };
}

function buildAdoptionReportDefinition(rows) {
    const seguimientosActivos = rows.reduce((acc, row) => acc + row.seguimientosActivos, 0);
    const seguimientosVencidos = rows.reduce((acc, row) => acc + row.seguimientosVencidos, 0);

    return {
        filename: 'reporte-adopciones-admin.pdf',
        title: 'Reporte administrativo de adopciones',
        subtitle: 'Seguimiento general del proceso de adopcion y su carga operativa.',
        columns: [
            { header: 'Fecha', key: 'fechaAdopcion', width: 1.1 },
            { header: 'Adoptante', key: 'adoptante', width: 2.5 },
            { header: 'Perrito', key: 'nombrePerrito', width: 1.8 },
            { header: 'Seg. total', key: 'totalSeguimientos', width: 1, align: 'right' },
            { header: 'Seg. activos', key: 'seguimientosActivos', width: 1.1, align: 'right' },
            { header: 'Seg. vencidos', key: 'seguimientosVencidos', width: 1.1, align: 'right' },
            { header: 'Estado', key: 'estado', width: 1.1 }
        ],
        rows,
        summary: [
            { label: 'Adopciones listadas', value: rows.length },
            { label: 'Seguimientos activos', value: seguimientosActivos },
            { label: 'Seguimientos vencidos', value: seguimientosVencidos },
            { label: 'Adopciones con alertas', value: rows.filter((row) => row.seguimientosVencidos > 0).length }
        ]
    };
}

function buildLowInventoryReportDefinition(rows) {
    const totalUnidades = rows.reduce((acc, row) => acc + row.cantidad, 0);
    const valorComprometido = rows.reduce((acc, row) => acc + row.valorEstimado, 0);

    return {
        filename: 'reporte-inventario-bajo-admin.pdf',
        title: 'Reporte de inventario bajo',
        subtitle: `Productos con existencias menores o iguales a ${LOW_STOCK_THRESHOLD} unidades.`,
        columns: [
            { header: 'Producto', key: 'producto', width: 2.5 },
            { header: 'Categoria', key: 'categoria', width: 1.5 },
            { header: 'Marca', key: 'marca', width: 1.4 },
            { header: 'Cantidad', key: 'cantidad', width: 0.9, align: 'right' },
            { header: 'Precio', key: 'precio', width: 1, align: 'right' },
            { header: 'Valor', key: 'valorEstimado', width: 1.2, align: 'right' },
            { header: 'Estado', key: 'estado', width: 1 }
        ],
        rows,
        summary: [
            { label: 'Productos afectados', value: rows.length },
            { label: 'Unidades en riesgo', value: totalUnidades },
            { label: 'Valor estimado', value: roundMoney(valorComprometido) },
            { label: 'Umbral de stock', value: LOW_STOCK_THRESHOLD }
        ]
    };
}

async function getAdminDashboardSummary() {
    return reportCache.getOrSet(SUMMARY_CACHE_KEY, async () => {
        const [summaryRow, inventoryRows, followUpRows, invoiceRows] = await Promise.all([
            reportRepository.findAdminDashboardSummary(),
            reportRepository.findLowInventoryReport(LOW_STOCK_THRESHOLD),
            reportRepository.findFollowUpAlerts(),
            reportRepository.findInvoiceReport()
        ]);

        if (!summaryRow) {
            throw createHttpError('Admin dashboard summary is unavailable', 404);
        }

        return {
            generatedAt: new Date().toISOString(),
            stockThreshold: LOW_STOCK_THRESHOLD,
            metrics: formatSummaryMetrics(summaryRow),
            lowStockProducts: inventoryRows.slice(0, 5).map(formatLowInventoryReportRow),
            followUpAlerts: followUpRows.slice(0, 5).map(formatFollowUpAlertRow),
            recentInvoices: invoiceRows.slice(0, 5).map(formatInvoiceReportRow)
        };
    });
}

async function getAdminReportPdfDefinition(reportType) {
    if (!SUPPORTED_ADMIN_REPORT_TYPES.includes(reportType)) {
        throw createHttpError('Unsupported admin report type', 400);
    }

    return reportCache.getOrSet(createReportCacheKey(reportType), async () => {
        switch (reportType) {
        case 'facturas': {
            const rows = (await reportRepository.findInvoiceReport()).map(formatInvoiceReportRow);
            return buildInvoiceReportDefinition(rows);
        }
        case 'donaciones': {
            const rows = (await reportRepository.findDonationReport()).map(
                formatDonationReportRow
            );
            return buildDonationReportDefinition(rows);
        }
        case 'adopciones': {
            const rows = (await reportRepository.findAdoptionReport()).map(
                formatAdoptionReportRow
            );
            return buildAdoptionReportDefinition(rows);
        }
        case 'inventario-bajo': {
            const rows = (await reportRepository.findLowInventoryReport(LOW_STOCK_THRESHOLD)).map(
                formatLowInventoryReportRow
            );
            return buildLowInventoryReportDefinition(rows);
        }
        default:
            throw createHttpError('Unsupported admin report type', 400);
        }
    });
}

module.exports = {
    SUPPORTED_ADMIN_REPORT_TYPES,
    getAdminDashboardSummary,
    getAdminReportPdfDefinition
};
