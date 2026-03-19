const express = require('express');
const dogController = require('../controllers/dogController');

const router = express.Router();

router.get('/', dogController.getAvailableDogs);
router.get('/:idPerrito', dogController.dogIdValidation, dogController.getDogById);

module.exports = router;
