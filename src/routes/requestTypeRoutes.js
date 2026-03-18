const express = require('express');
const requestTypeController = require('../controllers/requestTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, requestTypeController.getRequestTypes);
router.get(
    '/:idTipoSolicitud',
    authenticateToken,
    requireAdmin,
    requestTypeController.requestTypeIdValidation,
    requestTypeController.getRequestTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    requestTypeController.requestTypeValidation,
    requestTypeController.createRequestType
);
router.put(
    '/:idTipoSolicitud',
    authenticateToken,
    requireAdmin,
    [
        ...requestTypeController.requestTypeIdValidation,
        ...requestTypeController.requestTypeValidation
    ],
    requestTypeController.updateRequestType
);
router.delete(
    '/:idTipoSolicitud',
    authenticateToken,
    requireAdmin,
    requestTypeController.requestTypeIdValidation,
    requestTypeController.deleteRequestType
);

module.exports = router;
