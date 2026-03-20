const express = require('express');
const houseDogController = require('../controllers/houseDogController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, houseDogController.getHouseDogs);
router.get(
    '/:idCasaCuna/:idPerrito',
    authenticateToken,
    requireAdmin,
    houseDogController.houseDogKeyValidation,
    houseDogController.getHouseDogByPk
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    houseDogController.createHouseDogValidation,
    houseDogController.createHouseDog
);
router.put(
    '/:idCasaCuna/:idPerrito',
    authenticateToken,
    requireAdmin,
    [
        ...houseDogController.houseDogKeyValidation,
        ...houseDogController.updateHouseDogValidation
    ],
    houseDogController.updateHouseDog
);
router.delete(
    '/:idCasaCuna/:idPerrito',
    authenticateToken,
    requireAdmin,
    houseDogController.houseDogKeyValidation,
    houseDogController.deleteHouseDog
);

module.exports = router;
