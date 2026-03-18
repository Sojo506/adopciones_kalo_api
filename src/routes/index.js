const express = require('express');

const router = express.Router();

router.use('/auth', require('./userRoutes'));
router.use('/catalogs', require('./catalogRoutes'));
router.use('/locations', require('./locationRoutes'));
router.use('/countries', require('./countryRoutes'));
router.use('/provinces', require('./provinceRoutes'));
router.use('/cantons', require('./cantonRoutes'));
router.use('/districts', require('./districtRoutes'));
router.use('/addresses', require('./addressRoutes'));
router.use('/states', require('./stateRoutes'));
router.use('/otp-types', require('./otpTypeRoutes'));
router.use('/categories', require('./categoryRoutes'));
router.use('/brands', require('./brandRoutes'));
router.use('/currencies', require('./currencyRoutes'));
router.use('/breeds', require('./breedRoutes'));
router.use('/sexes', require('./sexRoutes'));
router.use('/request-types', require('./requestTypeRoutes'));
router.use('/response-types', require('./responseTypeRoutes'));
router.use('/tracking-types', require('./trackingTypeRoutes'));
router.use('/event-types', require('./eventTypeRoutes'));
router.use('/questions', require('./questionRoutes'));
router.use('/user-types', require('./userTypeRoutes'));
router.use('/emails', require('./emailRoutes'));
router.use('/phones', require('./phoneRoutes'));
router.use('/accounts', require('./accountRoutes'));
router.use('/otp-codes', require('./otpRoutes'));
router.use('/refresh-tokens', require('./refreshTokenRoutes'));

module.exports = router;
