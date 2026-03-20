const express = require('express');
const dogController = require('../controllers/dogController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/admin', authenticateToken, requireAdmin, dogController.getDogs);
router.get(
    '/admin/:idPerrito',
    authenticateToken,
    requireAdmin,
    dogController.dogIdValidation,
    dogController.getDogByIdForAdmin
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
router.get('/', dogController.getAvailableDogs);
router.get('/:idPerrito', dogController.dogIdValidation, dogController.getDogById);

module.exports = router;
