const express = require('express');

const router = express.Router();

router.use('/auth', require('./userRoutes'));
router.use('/locations', require('./locationRoutes'));

module.exports = router;
