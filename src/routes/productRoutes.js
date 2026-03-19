const express = require('express');
const productController = require('../controllers/productController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, productController.getProducts);
router.get(
    '/:idProducto',
    authenticateToken,
    requireAdmin,
    productController.productIdValidation,
    productController.getProductById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    productController.productValidation,
    productController.createProduct
);
router.put(
    '/:idProducto',
    authenticateToken,
    requireAdmin,
    [...productController.productIdValidation, ...productController.productValidation],
    productController.updateProduct
);
router.delete(
    '/:idProducto',
    authenticateToken,
    requireAdmin,
    productController.productIdValidation,
    productController.deleteProduct
);

module.exports = router;
