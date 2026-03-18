const express = require('express');
const provinceController = require('../controllers/provinceController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, provinceController.getProvinces);
router.get(
    '/:idProvincia',
    authenticateToken,
    requireAdmin,
    provinceController.provinceIdValidation,
    provinceController.getProvinceById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    provinceController.provinceBodyValidation,
    provinceController.createProvince
);
router.put(
    '/:idProvincia',
    authenticateToken,
    requireAdmin,
    [...provinceController.provinceIdValidation, ...provinceController.provinceBodyValidation],
    provinceController.updateProvince
);
router.delete(
    '/:idProvincia',
    authenticateToken,
    requireAdmin,
    provinceController.provinceIdValidation,
    provinceController.deleteProvince
);

module.exports = router;
