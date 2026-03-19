const express = require('express');
const districtController = require('../controllers/districtController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, districtController.getDistricts);
router.get(
    '/:idDistrito',
    authenticateToken,
    requireAdmin,
    districtController.districtIdValidation,
    districtController.getDistrictById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    districtController.districtBodyValidation,
    districtController.createDistrict
);
router.put(
    '/:idDistrito',
    authenticateToken,
    requireAdmin,
    [...districtController.districtIdValidation, ...districtController.districtBodyValidation],
    districtController.updateDistrict
);
router.delete(
    '/:idDistrito',
    authenticateToken,
    requireAdmin,
    districtController.districtIdValidation,
    districtController.deleteDistrict
);

module.exports = router;
