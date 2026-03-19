const express = require('express');
const requestController = require('../controllers/requestController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', requestController.getRequests);
router.get(
    '/:idSolicitud',
    requestController.requestIdValidation,
    requestController.getRequestById
);
router.post('/', requestController.requestValidation, requestController.createRequest);
router.put(
    '/:idSolicitud',
    [...requestController.requestIdValidation, ...requestController.requestValidation],
    requestController.updateRequest
);
router.delete(
    '/:idSolicitud',
    requestController.requestIdValidation,
    requestController.deleteRequest
);

module.exports = router;
