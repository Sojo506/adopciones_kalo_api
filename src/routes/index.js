const express = require('express');

const router = express.Router();

router.use('/auth', require('./userRoutes'));
router.use('/catalogs', require('./catalogRoutes'));
router.use('/locations', require('./locationRoutes'));
router.use('/user-types', require('./userTypeRoutes'));
router.use('/emails', require('./emailRoutes'));
router.use('/phones', require('./phoneRoutes'));
router.use('/accounts', require('./accountRoutes'));

module.exports = router;
