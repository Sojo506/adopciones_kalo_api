const express = require('express');
const dogEventController = require('../controllers/dogEventController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, dogEventController.getDogEvents);
router.get(
    '/:idEvento',
    authenticateToken,
    requireAdmin,
    dogEventController.dogEventIdValidation,
    dogEventController.getDogEventById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    dogEventController.createDogEventValidation,
    dogEventController.createDogEvent
);
router.put(
    '/:idEvento',
    authenticateToken,
    requireAdmin,
    [
        ...dogEventController.dogEventIdValidation,
        ...dogEventController.updateDogEventValidation
    ],
    dogEventController.updateDogEvent
);
router.delete(
    '/:idEvento',
    authenticateToken,
    requireAdmin,
    dogEventController.dogEventIdValidation,
    dogEventController.deleteDogEvent
);

module.exports = router;
