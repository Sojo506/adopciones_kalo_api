const PDFDocument = require('pdfkit');

const DEFAULT_DOC_OPTIONS = {
    size: 'A4',
    layout: 'landscape',
    margin: 36
};

function formatDate(value) {
    if (!value) {
        return '-';
    }

    const date = value instanceof Date ? value : new Date(value);

    if (Number.isNaN(date.getTime())) {
        return String(value);
    }

    return new Intl.DateTimeFormat('es-CR', {
        dateStyle: 'medium'
    }).format(date);
}

function formatNumber(value) {
    return new Intl.NumberFormat('es-CR', {
        minimumFractionDigits: Number.isInteger(Number(value)) ? 0 : 2,
        maximumFractionDigits: 2
    }).format(Number(value || 0));
}

function formatCellValue(value) {
    if (value === null || value === undefined || value === '') {
        return '-';
    }

    if (typeof value === 'number') {
        return formatNumber(value);
    }

    if (value instanceof Date) {
        return formatDate(value);
    }

    if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
        return formatDate(value);
    }

    return String(value);
}

function fitText(doc, text, width) {
    const normalizedText = formatCellValue(text);

    if (doc.widthOfString(normalizedText) <= width) {
        return normalizedText;
    }

    let shortenedText = normalizedText;

    while (shortenedText.length > 1 && doc.widthOfString(`${shortenedText}...`) > width) {
        shortenedText = shortenedText.slice(0, -1);
    }

    return `${shortenedText}...`;
}

function setDownloadHeaders(res, filename) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
}

function drawSummary(doc, summaryItems, startY) {
    if (!Array.isArray(summaryItems) || summaryItems.length === 0) {
        return startY;
    }

    const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const columnGap = 16;
    const columnWidth = (availableWidth - columnGap) / 2;
    const rowHeight = 34;
    let y = startY;

    summaryItems.forEach((item, index) => {
        const column = index % 2;

        if (column === 0 && index > 0) {
            y += rowHeight;
        }

        const x = doc.page.margins.left + column * (columnWidth + columnGap);

        doc
            .roundedRect(x, y, columnWidth, 26, 8)
            .fillAndStroke('#f4f6f8', '#d9e0e7');

        doc
            .fillColor('#536171')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text(item.label, x + 10, y + 6, { width: columnWidth - 20 });

        doc
            .fillColor('#11253d')
            .font('Helvetica')
            .fontSize(10)
            .text(formatCellValue(item.value), x + 10, y + 14, { width: columnWidth - 20 });
    });

    return y + rowHeight;
}

function getColumnWidths(doc, columns) {
    const availableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
    const totalWeight = columns.reduce((acc, column) => acc + (column.width || 1), 0);

    return columns.map((column) => (availableWidth * (column.width || 1)) / totalWeight);
}

function drawTableHeader(doc, columns, columnWidths, y) {
    let currentX = doc.page.margins.left;

    columns.forEach((column, index) => {
        const width = columnWidths[index];

        doc.rect(currentX, y, width, 24).fillAndStroke('#183c63', '#183c63');
        doc
            .fillColor('#ffffff')
            .font('Helvetica-Bold')
            .fontSize(8)
            .text(column.header, currentX + 6, y + 8, {
                width: width - 12,
                align: column.align || 'left'
            });

        currentX += width;
    });
}

function drawTableRow(doc, columns, columnWidths, row, y) {
    let currentX = doc.page.margins.left;

    columns.forEach((column, index) => {
        const width = columnWidths[index];
        const backgroundColor = y % 40 === 0 ? '#f9fbfc' : '#ffffff';

        doc.rect(currentX, y, width, 20).fillAndStroke(backgroundColor, '#e2e8ef');
        doc
            .fillColor('#1c2733')
            .font('Helvetica')
            .fontSize(8)
            .text(fitText(doc, row[column.key], width - 12), currentX + 6, y + 6, {
                width: width - 12,
                align: column.align || 'left'
            });

        currentX += width;
    });
}

function ensureTableSpace(doc, currentY, minHeight) {
    const bottomLimit = doc.page.height - doc.page.margins.bottom;

    if (currentY + minHeight <= bottomLimit) {
        return currentY;
    }

    doc.addPage();
    return doc.page.margins.top;
}

function generateTabularReport(res, reportDefinition) {
    const filename = reportDefinition.filename || 'reporte.pdf';
    const columns = Array.isArray(reportDefinition.columns) ? reportDefinition.columns : [];
    const rows = Array.isArray(reportDefinition.rows) ? reportDefinition.rows : [];
    const summary = Array.isArray(reportDefinition.summary) ? reportDefinition.summary : [];

    setDownloadHeaders(res, filename);

    const doc = new PDFDocument(DEFAULT_DOC_OPTIONS);
    doc.pipe(res);

    doc
        .font('Helvetica-Bold')
        .fontSize(20)
        .fillColor('#11253d')
        .text(reportDefinition.title || 'Reporte administrativo', {
            align: 'left'
        });

    if (reportDefinition.subtitle) {
        doc
            .moveDown(0.35)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#5e6b78')
            .text(reportDefinition.subtitle);
    }

    doc
        .moveDown(0.4)
        .font('Helvetica')
        .fontSize(9)
        .fillColor('#778391')
        .text(`Generado: ${formatDate(new Date())}`);

    let currentY = doc.y + 12;
    currentY = drawSummary(doc, summary, currentY) + 4;

    if (columns.length === 0) {
        doc
            .moveTo(doc.page.margins.left, currentY)
            .font('Helvetica')
            .fontSize(10)
            .fillColor('#5e6b78')
            .text('No hay columnas configuradas para este reporte.');
        doc.end();
        return;
    }

    const columnWidths = getColumnWidths(doc, columns);
    currentY = ensureTableSpace(doc, currentY, 44);
    drawTableHeader(doc, columns, columnWidths, currentY);
    currentY += 24;

    if (rows.length === 0) {
        drawTableRow(doc, columns, columnWidths, {}, currentY);
        doc
            .fillColor('#5e6b78')
            .font('Helvetica-Oblique')
            .fontSize(8)
            .text(
                reportDefinition.emptyMessage || 'No hay registros para mostrar en este reporte.',
                doc.page.margins.left + 6,
                currentY + 6,
                {
                    width:
                        doc.page.width - doc.page.margins.left - doc.page.margins.right - 12
                }
            );

        doc.end();
        return;
    }

    rows.forEach((row) => {
        currentY = ensureTableSpace(doc, currentY, 24);

        if (currentY === doc.page.margins.top) {
            drawTableHeader(doc, columns, columnWidths, currentY);
            currentY += 24;
        }

        drawTableRow(doc, columns, columnWidths, row, currentY);
        currentY += 20;
    });

    doc.end();
}

function generateSimpleReport(res, title, data) {
    generateTabularReport(res, {
        title,
        columns: [{ header: 'Registro', key: 'value', width: 1 }],
        rows: Array.isArray(data) ? data.map((item) => ({ value: JSON.stringify(item) })) : []
    });
}

module.exports = {
    generateSimpleReport,
    generateTabularReport
};
