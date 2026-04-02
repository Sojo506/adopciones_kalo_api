const express = require('express');
const evidenceController = require('../controllers/evidenceController');
const evidenceImageUpload = require('../middlewares/evidenceImageUpload');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken);

router.get('/', evidenceController.getEvidences);
router.get(
    '/follow-up/:idSeguimiento',
    evidenceController.followUpIdValidation,
    evidenceController.getEvidencesByFollowUp
);
router.get(
    '/:idEvidencia',
    evidenceController.evidenceIdValidation,
    evidenceController.getEvidenceById
);
router.post(
    '/',
    evidenceImageUpload.single('image'),
    evidenceController.createEvidenceValidation,
    evidenceController.createEvidence
);
router.put(
    '/:idEvidencia',
    evidenceImageUpload.single('image'),
    [
        ...evidenceController.evidenceIdValidation,
        ...evidenceController.updateEvidenceValidation
    ],
    evidenceController.updateEvidence
);
router.delete(
    '/:idEvidencia',
    evidenceController.evidenceIdValidation,
    evidenceController.deleteEvidence
);

module.exports = router;
