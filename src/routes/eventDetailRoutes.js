const express = require('express');
const eventDetailController = require('../controllers/eventDetailController');
const eventDetailUpload = require('../middlewares/eventDetailUpload');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.get('/', authenticateToken, requireAdmin, eventDetailController.getEventDetails);
router.get(
    '/event/:idEvento',
    authenticateToken,
    requireAdmin,
    eventDetailController.dogEventIdValidation,
    eventDetailController.getEventDetailsByEvent
);
router.get(
    '/:idDetalleEvento',
    authenticateToken,
    requireAdmin,
    eventDetailController.eventDetailIdValidation,
    eventDetailController.getEventDetailById
);
router.post(
    '/',
    authenticateToken,
    requireAdmin,
    eventDetailUpload.single('image'),
    eventDetailController.createEventDetailValidation,
    eventDetailController.createEventDetail
);
router.put(
    '/:idDetalleEvento',
    authenticateToken,
    requireAdmin,
    eventDetailUpload.single('image'),
    [
        ...eventDetailController.eventDetailIdValidation,
        ...eventDetailController.updateEventDetailValidation
    ],
    eventDetailController.updateEventDetail
);
router.delete(
    '/:idDetalleEvento',
    authenticateToken,
    requireAdmin,
    eventDetailController.eventDetailIdValidation,
    eventDetailController.deleteEventDetail
);

module.exports = router;
