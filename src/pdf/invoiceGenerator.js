const PDFDocument = require('pdfkit');

function formatDate(value) {
    if (!value) return '-';
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return new Intl.DateTimeFormat('es-CR', { dateStyle: 'long' }).format(date);
}

function formatCurrency(value, symbol = '₡') {
    const num = Number(value || 0);
    return `${symbol}${new Intl.NumberFormat('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)}`;
}

/**
 * Generates a store‑purchase invoice PDF and returns it as a Buffer.
 *
 * @param {object} data
 * @param {string} data.idFactura
 * @param {string} data.fecha
 * @param {string} data.cliente       – full customer name
 * @param {string} data.correo        – customer email
 * @param {string} data.moneda        – currency name
 * @param {string} data.simbolo       – currency symbol (e.g. ₡, $)
 * @param {number} data.tasaImpuesto  – tax rate applied (e.g. 0.13)
 * @param {number} data.subtotal
 * @param {number} data.impuesto
 * @param {number} data.total
 * @param {Array}  data.items         – [{ nombre, cantidad, precioUnitario, total }]
 * @param {string} data.paypalOrderId
 * @returns {Promise<Buffer>}
 */
function generateInvoicePdf(data) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        const sym = data.simbolo || '₡';

        const doc = new PDFDocument({ size: 'A4', margin: 48 });
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ── Header ──────────────────────────────────────────────────────
        doc
            .font('Helvetica-Bold')
            .fontSize(22)
            .fillColor('#11253d')
            .text('Adopciones Kalo', { align: 'left' });

        doc
            .moveDown(0.2)
            .font('Helvetica')
            .fontSize(9)
            .fillColor('#5e6b78')
            .text('Tienda en linea — Comprobante de compra');

        doc.moveDown(1);

        // ── Invoice metadata ────────────────────────────────────────────
        const metaTop = doc.y;
        const rightCol = 340;

        doc.font('Helvetica-Bold').fontSize(9).fillColor('#11253d');
        doc.text('Factura', 48, metaTop);
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(`#${data.idFactura}`, 120, metaTop);

        doc.font('Helvetica-Bold').fillColor('#11253d');
        doc.text('Fecha', 48, metaTop + 16);
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(formatDate(data.fecha), 120, metaTop + 16);

        doc.font('Helvetica-Bold').fillColor('#11253d');
        doc.text('Cliente', 48, metaTop + 32);
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(data.cliente || '-', 120, metaTop + 32);

        doc.font('Helvetica-Bold').fillColor('#11253d');
        doc.text('Correo', 48, metaTop + 48);
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(data.correo || '-', 120, metaTop + 48);

        if (data.paypalOrderId) {
            doc.font('Helvetica-Bold').fillColor('#11253d');
            doc.text('PayPal Order', rightCol, metaTop);
            doc.font('Helvetica').fillColor('#1c2733');
            doc.text(data.paypalOrderId, rightCol + 80, metaTop);
        }

        doc.font('Helvetica-Bold').fillColor('#11253d');
        doc.text('Moneda', rightCol, metaTop + 16);
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(data.moneda || '-', rightCol + 80, metaTop + 16);

        doc.y = metaTop + 76;
        doc.moveDown(0.5);

        // ── Separator ───────────────────────────────────────────────────
        const separatorY = doc.y;
        doc
            .moveTo(48, separatorY)
            .lineTo(doc.page.width - 48, separatorY)
            .strokeColor('#d9e0e7')
            .lineWidth(1)
            .stroke();

        doc.y = separatorY + 12;

        // ── Table header ────────────────────────────────────────────────
        const cols = { name: 48, qty: 310, unit: 380, total: 460 };
        const tableHeaderY = doc.y;

        doc
            .rect(48, tableHeaderY, doc.page.width - 96, 22)
            .fill('#183c63');

        doc.font('Helvetica-Bold').fontSize(8).fillColor('#ffffff');
        doc.text('Producto', cols.name + 8, tableHeaderY + 7, { width: 240 });
        doc.text('Cant.', cols.qty + 8, tableHeaderY + 7, { width: 50, align: 'center' });
        doc.text('P. Unitario', cols.unit + 8, tableHeaderY + 7, { width: 70, align: 'right' });
        doc.text('Total', cols.total + 8, tableHeaderY + 7, { width: 70, align: 'right' });

        let rowY = tableHeaderY + 22;

        // ── Table rows ──────────────────────────────────────────────────
        const items = Array.isArray(data.items) ? data.items : [];

        items.forEach((item, index) => {
            const bg = index % 2 === 0 ? '#f9fbfc' : '#ffffff';

            doc.rect(48, rowY, doc.page.width - 96, 20).fill(bg);

            doc.font('Helvetica').fontSize(8).fillColor('#1c2733');
            doc.text(item.nombre || '-', cols.name + 8, rowY + 6, { width: 240 });
            doc.text(String(item.cantidad || 0), cols.qty + 8, rowY + 6, { width: 50, align: 'center' });
            doc.text(formatCurrency(item.precioUnitario, sym), cols.unit + 8, rowY + 6, { width: 70, align: 'right' });
            doc.text(formatCurrency(item.total, sym), cols.total + 8, rowY + 6, { width: 70, align: 'right' });

            rowY += 20;
        });

        // ── Totals ──────────────────────────────────────────────────────
        rowY += 10;
        const totalsX = 380;
        const totalsValX = 460;
        const taxPercent = `${((data.tasaImpuesto || 0) * 100).toFixed(2)}%`;

        doc.font('Helvetica').fontSize(9).fillColor('#5e6b78');
        doc.text('Subtotal (sin IVA)', totalsX - 30, rowY, { width: 100, align: 'right' });
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(formatCurrency(data.subtotal, sym), totalsValX + 8, rowY, { width: 70, align: 'right' });

        rowY += 16;
        doc.font('Helvetica').fillColor('#5e6b78');
        doc.text(`IVA incluido (${taxPercent})`, totalsX - 30, rowY, { width: 100, align: 'right' });
        doc.font('Helvetica').fillColor('#1c2733');
        doc.text(formatCurrency(data.impuesto, sym), totalsValX + 8, rowY, { width: 70, align: 'right' });

        rowY += 20;
        doc
            .moveTo(totalsX, rowY)
            .lineTo(totalsValX + 78, rowY)
            .strokeColor('#183c63')
            .lineWidth(1)
            .stroke();

        rowY += 6;
        doc.font('Helvetica-Bold').fontSize(12).fillColor('#11253d');
        doc.text('Total', totalsX, rowY, { width: 70, align: 'right' });
        doc.text(formatCurrency(data.total, sym), totalsValX + 8, rowY, { width: 70, align: 'right' });

        // ── Footer ──────────────────────────────────────────────────────
        doc
            .moveDown(3)
            .font('Helvetica')
            .fontSize(8)
            .fillColor('#778391')
            .text(
                'Gracias por tu compra. Cada compra apoya directamente a los perritos de Kalo.',
                48,
                doc.y,
                { align: 'center', width: doc.page.width - 96 }
            );

        doc.end();
    });
}

module.exports = { generateInvoicePdf };
