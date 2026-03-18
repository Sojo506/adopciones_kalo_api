const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/user-types', catalogController.getUserTypes);
router.get('/states', catalogController.getStates);
router.get('/otp-types', catalogController.getOtpTypes);
router.get('/categories', catalogController.getCategories);
router.get('/brands', catalogController.getBrands);
router.get('/currencies', catalogController.getCurrencies);
router.get('/breeds', catalogController.getBreeds);
router.get('/sexes', catalogController.getSexes);
router.get('/request-types', catalogController.getRequestTypes);

module.exports = router;
