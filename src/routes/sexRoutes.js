const express = require('express');
const sexController = require('../controllers/sexController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, sexController.getSexes);
router.get(
    '/:idSexo',
    authenticateToken,
    requireAdmin,
    sexController.sexIdValidation,
    sexController.getSexById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    sexController.sexValidation,
    sexController.createSex
);
router.put(
    '/:idSexo',
    authenticateToken,
    requireAdmin,
    [...sexController.sexIdValidation, ...sexController.sexValidation],
    sexController.updateSex
);
router.delete(
    '/:idSexo',
    authenticateToken,
    requireAdmin,
    sexController.sexIdValidation,
    sexController.deleteSex
);

module.exports = router;
