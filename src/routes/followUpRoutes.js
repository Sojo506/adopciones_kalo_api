const express = require('express');
const followUpController = require('../controllers/followUpController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', followUpController.getFollowUps);
router.get(
    '/:idSeguimiento',
    followUpController.followUpIdValidation,
    followUpController.getFollowUpById
);
router.post(
    '/',
    followUpController.createFollowUpValidation,
    followUpController.createFollowUp
);
router.put(
    '/:idSeguimiento',
    [
        ...followUpController.followUpIdValidation,
        ...followUpController.updateFollowUpValidation
    ],
    followUpController.updateFollowUp
);
router.delete(
    '/:idSeguimiento',
    followUpController.followUpIdValidation,
    followUpController.deleteFollowUp
);

module.exports = router;
