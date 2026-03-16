const express = require('express');
const locationController = require('../controllers/locationController');

const router = express.Router();

router.get('/countries', locationController.getCountries);
router.get('/provinces', locationController.getProvinces);
router.get('/cantons', locationController.getCantons);
router.get('/districts', locationController.getDistricts);

module.exports = router;
