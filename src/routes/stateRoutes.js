const express = require('express');
const stateController = require('../controllers/stateController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, stateController.getStates);
router.get(
    '/:idEstado',
    authenticateToken,
    requireAdmin,
    stateController.stateIdValidation,
    stateController.getStateById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    stateController.stateBodyValidation,
    stateController.createState
);
router.put(
    '/:idEstado',
    authenticateToken,
    requireAdmin,
    [...stateController.stateIdValidation, ...stateController.stateBodyValidation],
    stateController.updateState
);
router.delete(
    '/:idEstado',
    authenticateToken,
    requireAdmin,
    stateController.stateIdValidation,
    stateController.deleteState
);

module.exports = router;
