const express = require('express');
const adoptionController = require('../controllers/adoptionController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', adoptionController.getAdoptions);
router.get(
    '/:idAdopcion',
    adoptionController.adoptionIdValidation,
    adoptionController.getAdoptionById
);
router.post(
    '/',
    adoptionController.createAdoptionValidation,
    adoptionController.createAdoption
);
router.put(
    '/:idAdopcion',
    [
        ...adoptionController.adoptionIdValidation,
        ...adoptionController.updateAdoptionValidation
    ],
    adoptionController.updateAdoption
);
router.delete(
    '/:idAdopcion',
    adoptionController.adoptionIdValidation,
    adoptionController.deleteAdoption
);

module.exports = router;
