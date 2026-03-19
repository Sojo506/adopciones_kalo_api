const express = require('express');
const responseController = require('../controllers/responseController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, responseController.getResponses);
router.get(
    '/:idRespuesta',
    authenticateToken,
    requireAdmin,
    responseController.responseIdValidation,
    responseController.getResponseById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    responseController.responseValidation,
    responseController.createResponse
);
router.put(
    '/:idRespuesta',
    authenticateToken,
    requireAdmin,
    [
        ...responseController.responseIdValidation,
        ...responseController.responseValidation
    ],
    responseController.updateResponse
);
router.delete(
    '/:idRespuesta',
    authenticateToken,
    requireAdmin,
    responseController.responseIdValidation,
    responseController.deleteResponse
);

module.exports = router;
