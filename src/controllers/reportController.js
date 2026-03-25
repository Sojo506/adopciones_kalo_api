const { param, validationResult } = require('express-validator');
const {
    SUPPORTED_ADMIN_REPORT_TYPES,
    getAdminDashboardSummary,
    getAdminReportPdfDefinition
} = require('../services/reportService');
const { generateTabularReport } = require('../pdf/reportGenerator');

function validationErrorResponse(req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return null;
    }

    return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array()
    });
}

const reportTypeValidation = [
    param('reportType')
        .trim()
        .isIn(SUPPORTED_ADMIN_REPORT_TYPES)
        .withMessage(
            `Report type must be one of: ${SUPPORTED_ADMIN_REPORT_TYPES.join(', ')}`
        )
];

async function getSummary(req, res, next) {
    try {
        const summary = await getAdminDashboardSummary();

        res.status(200).json({
            ok: true,
            data: summary
        });
    } catch (error) {
        next(error);
    }
}

async function downloadPdf(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const reportDefinition = await getAdminReportPdfDefinition(req.params.reportType);
        generateTabularReport(res, reportDefinition);
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getSummary,
    downloadPdf,
    reportTypeValidation
};
