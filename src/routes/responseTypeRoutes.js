const express = require('express');
const responseTypeController = require('../controllers/responseTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, responseTypeController.getResponseTypes);
router.get(
    '/:idTipoRespuesta',
    authenticateToken,
    requireAdmin,
    responseTypeController.responseTypeIdValidation,
    responseTypeController.getResponseTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    responseTypeController.responseTypeValidation,
    responseTypeController.createResponseType
);
router.put(
    '/:idTipoRespuesta',
    authenticateToken,
    requireAdmin,
    [
        ...responseTypeController.responseTypeIdValidation,
        ...responseTypeController.responseTypeValidation
    ],
    responseTypeController.updateResponseType
);
router.delete(
    '/:idTipoRespuesta',
    authenticateToken,
    requireAdmin,
    responseTypeController.responseTypeIdValidation,
    responseTypeController.deleteResponseType
);

module.exports = router;
