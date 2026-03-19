const express = require('express');
const breedController = require('../controllers/breedController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, breedController.getBreeds);
router.get(
    '/:idRaza',
    authenticateToken,
    requireAdmin,
    breedController.breedIdValidation,
    breedController.getBreedById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    breedController.breedValidation,
    breedController.createBreed
);
router.put(
    '/:idRaza',
    authenticateToken,
    requireAdmin,
    [...breedController.breedIdValidation, ...breedController.breedValidation],
    breedController.updateBreed
);
router.delete(
    '/:idRaza',
    authenticateToken,
    requireAdmin,
    breedController.breedIdValidation,
    breedController.deleteBreed
);

module.exports = router;
