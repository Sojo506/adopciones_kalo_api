const express = require('express');
const categoryController = require('../controllers/categoryController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, categoryController.getCategories);
router.get(
    '/:idCategoria',
    authenticateToken,
    requireAdmin,
    categoryController.categoryIdValidation,
    categoryController.getCategoryById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    categoryController.categoryValidation,
    categoryController.createCategory
);
router.put(
    '/:idCategoria',
    authenticateToken,
    requireAdmin,
    [...categoryController.categoryIdValidation, ...categoryController.categoryValidation],
    categoryController.updateCategory
);
router.delete(
    '/:idCategoria',
    authenticateToken,
    requireAdmin,
    categoryController.categoryIdValidation,
    categoryController.deleteCategory
);

module.exports = router;
