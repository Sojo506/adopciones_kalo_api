const express = require('express');
const eventTypeController = require('../controllers/eventTypeController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, eventTypeController.getEventTypes);
router.get(
    '/:idTipoEvento',
    authenticateToken,
    requireAdmin,
    eventTypeController.eventTypeIdValidation,
    eventTypeController.getEventTypeById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    eventTypeController.eventTypeValidation,
    eventTypeController.createEventType
);
router.put(
    '/:idTipoEvento',
    authenticateToken,
    requireAdmin,
    [
        ...eventTypeController.eventTypeIdValidation,
        ...eventTypeController.eventTypeValidation
    ],
    eventTypeController.updateEventType
);
router.delete(
    '/:idTipoEvento',
    authenticateToken,
    requireAdmin,
    eventTypeController.eventTypeIdValidation,
    eventTypeController.deleteEventType
);

module.exports = router;
