const express = require('express');
const dogImageController = require('../controllers/dogImageController');
const dogImageUpload = require('../middlewares/dogImageUpload');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/dog/:idPerrito',
    authenticateToken,
    requireAdmin,
    dogImageController.dogIdValidation,
    dogImageController.getDogImagesByDog
);
router.get(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    dogImageController.dogImageIdValidation,
    dogImageController.getDogImageById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    dogImageUpload.single('image'),
    dogImageController.dogImageCreateValidation,
    dogImageController.createDogImage
);
router.put(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    dogImageUpload.single('image'),
    [
        ...dogImageController.dogImageIdValidation,
        ...dogImageController.dogImageUpdateValidation
    ],
    dogImageController.updateDogImage
);
router.delete(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    dogImageController.dogImageIdValidation,
    dogImageController.deleteDogImage
);

module.exports = router;
