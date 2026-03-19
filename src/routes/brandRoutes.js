const express = require('express');
const brandController = require('../controllers/brandController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, brandController.getBrands);
router.get(
    '/:idMarca',
    authenticateToken,
    requireAdmin,
    brandController.brandIdValidation,
    brandController.getBrandById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    brandController.brandValidation,
    brandController.createBrand
);
router.put(
    '/:idMarca',
    authenticateToken,
    requireAdmin,
    [...brandController.brandIdValidation, ...brandController.brandValidation],
    brandController.updateBrand
);
router.delete(
    '/:idMarca',
    authenticateToken,
    requireAdmin,
    brandController.brandIdValidation,
    brandController.deleteBrand
);

module.exports = router;
