const express = require('express');
const productImageController = require('../controllers/productImageController');
const productImageUpload = require('../middlewares/productImageUpload');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get(
    '/product/:idProducto',
    authenticateToken,
    requireAdmin,
    productImageController.productIdValidation,
    productImageController.getProductImagesByProduct
);
router.get(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    productImageController.productImageIdValidation,
    productImageController.getProductImageById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    productImageUpload.single('image'),
    productImageController.productImageCreateValidation,
    productImageController.createProductImage
);
router.put(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    productImageUpload.single('image'),
    [
        ...productImageController.productImageIdValidation,
        ...productImageController.productImageUpdateValidation
    ],
    productImageController.updateProductImage
);
router.delete(
    '/:idImagen',
    authenticateToken,
    requireAdmin,
    productImageController.productImageIdValidation,
    productImageController.deleteProductImage
);

module.exports = router;
