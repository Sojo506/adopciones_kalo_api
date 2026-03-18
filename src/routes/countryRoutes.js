const express = require('express');
const countryController = require('../controllers/countryController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, countryController.getCountries);
router.get(
    '/:idPais',
    authenticateToken,
    requireAdmin,
    countryController.countryIdValidation,
    countryController.getCountryById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    countryController.countryBodyValidation,
    countryController.createCountry
);
router.put(
    '/:idPais',
    authenticateToken,
    requireAdmin,
    [...countryController.countryIdValidation, ...countryController.countryBodyValidation],
    countryController.updateCountry
);
router.delete(
    '/:idPais',
    authenticateToken,
    requireAdmin,
    countryController.countryIdValidation,
    countryController.deleteCountry
);

module.exports = router;
