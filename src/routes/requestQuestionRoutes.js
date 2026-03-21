const express = require('express');
const requestQuestionController = require('../controllers/requestQuestionController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/request-types/:idTipoSolicitud/questions',
    requestQuestionController.requestTypeIdValidation,
    requestQuestionController.getActiveQuestionsByRequestType
);
router.get(
    '/',
    authenticateToken,
    requireAdmin,
    requestQuestionController.getRequestQuestions
);
router.get(
    '/:idTipoSolicitud/:idPregunta',
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
    '/:idTipoSolicitud/:idPregunta',
    authenticateToken,
    requireAdmin,
    [
        ...requestQuestionController.requestQuestionKeyValidation,
        ...requestQuestionController.updateRequestQuestionValidation
    ],
    requestQuestionController.updateRequestQuestion
);
router.delete(
    '/:idTipoSolicitud/:idPregunta',
    authenticateToken,
    requireAdmin,
    requestQuestionController.requestQuestionKeyValidation,
    requestQuestionController.deleteRequestQuestion
);

module.exports = router;
