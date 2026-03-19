const express = require('express');
const userTypeController = require('../controllers/userTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, userTypeController.getUserTypes);
router.get(
    '/:idTipoUsuario',
    authenticateToken,
    requireAdmin,
    userTypeController.userTypeIdValidation,
    userTypeController.getUserTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    userTypeController.userTypeValidation,
    userTypeController.createUserType
);
router.put(
    '/:idTipoUsuario',
    authenticateToken,
    requireAdmin,
    [...userTypeController.userTypeIdValidation, ...userTypeController.userTypeValidation],
    userTypeController.updateUserType
);
router.delete(
    '/:idTipoUsuario',
    authenticateToken,
    requireAdmin,
    userTypeController.userTypeIdValidation,
    userTypeController.deleteUserType
);

module.exports = router;
