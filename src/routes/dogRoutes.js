const express = require('express');
const dogController = require('../controllers/dogController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, dogController.getDogs);
router.get(
    '/:idPerrito',
    authenticateToken,
    requireAdmin,
    dogController.dogIdValidation,
    dogController.getDogById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    dogController.createDogValidation,
    dogController.createDog
);
router.put(
    '/:idPerrito',
    authenticateToken,
    requireAdmin,
    [
        ...dogController.dogIdValidation,
        ...dogController.updateDogValidation
    ],
    dogController.updateDog
);
router.delete(
    '/:idPerrito',
    authenticateToken,
    requireAdmin,
    dogController.dogIdValidation,
    dogController.deleteDog
);

module.exports = router;
