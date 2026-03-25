const express = require('express');
const reportController = require('../controllers/reportController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/summary',
    authenticateToken,
    requireAdmin,
    reportController.getSummary
);

router.get(
    '/:reportType/pdf',
    authenticateToken,
    requireAdmin,
    reportController.reportTypeValidation,
    reportController.downloadPdf
);

module.exports = router;
