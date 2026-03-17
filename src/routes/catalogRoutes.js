const express = require('express');
const catalogController = require('../controllers/catalogController');

const router = express.Router();

router.get('/user-types', catalogController.getUserTypes);
router.get('/states', catalogController.getStates);

module.exports = router;
