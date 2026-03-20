const express = require('express');
const requestQuestionController = require('../controllers/requestQuestionController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/',
    authenticateToken,
    requireAdmin,
    requestQuestionController.getRequestQuestions
);
router.get(
    '/:idSolicitud/:idPregunta',
    authenticateToken,
    requireAdmin,
    requestQuestionController.requestQuestionKeyValidation,
    requestQuestionController.getRequestQuestionByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    requestQuestionController.createRequestQuestionValidation,
    requestQuestionController.createRequestQuestion
);
router.put(
    '/:idSolicitud/:idPregunta',
    authenticateToken,
    requireAdmin,
    [
        ...requestQuestionController.requestQuestionKeyValidation,
        ...requestQuestionController.updateRequestQuestionValidation
    ],
    requestQuestionController.updateRequestQuestion
);
router.delete(
    '/:idSolicitud/:idPregunta',
    authenticateToken,
    requireAdmin,
    requestQuestionController.requestQuestionKeyValidation,
    requestQuestionController.deleteRequestQuestion
);

module.exports = router;
