const PDFDocument = require("pdfkit");

function generateSimpleReport(res, title, data) {
    const doc = new PDFDocument();

    res.setHeader("Content-Type", "application/pdf");
    doc.pipe(res);

    doc.fontSize(20).text(title, { align: "center" });
    doc.moveDown();

    data.forEach(item => {
        doc.fontSize(12).text(JSON.stringify(item));
        doc.moveDown();
    });

    doc.end();
}

module.exports = { generateSimpleReport };