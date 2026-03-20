const express = require('express');
const fosterHomeController = require('../controllers/fosterHomeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, fosterHomeController.getFosterHomes);
router.get(
    '/:idCasaCuna',
    authenticateToken,
    requireAdmin,
    fosterHomeController.fosterHomeIdValidation,
    fosterHomeController.getFosterHomeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    fosterHomeController.fosterHomeBodyValidation,
    fosterHomeController.createFosterHome
);
router.put(
    '/:idCasaCuna',
    authenticateToken,
    requireAdmin,
    [
        ...fosterHomeController.fosterHomeIdValidation,
        ...fosterHomeController.fosterHomeBodyValidation
    ],
    fosterHomeController.updateFosterHome
);
router.delete(
    '/:idCasaCuna',
    authenticateToken,
    requireAdmin,
    fosterHomeController.fosterHomeIdValidation,
    fosterHomeController.deleteFosterHome
);

module.exports = router;
