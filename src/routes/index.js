const express = require('express');

const router = express.Router();

router.use('/auth', require('./userRoutes'));
router.use('/catalogs', require('./catalogRoutes'));
router.use('/locations', require('./locationRoutes'));

module.exports = router;
