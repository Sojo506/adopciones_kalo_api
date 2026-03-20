const express = require('express');
const adoptionRequestController = require('../controllers/adoptionRequestController');
const { authenticateToken } = require('../middlewares/auth');

const router = express.Router();

router.post(
    '/',
    authenticateToken,
    adoptionRequestController.submitAdoptionRequestValidation,
    adoptionRequestController.submitAdoptionRequest
);

module.exports = router;
