const express = require('express');
const campaignController = require('../controllers/campaignController');
const { authenticateToken, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

router.use(authenticateToken, requireAdmin);

router.get('/', campaignController.getCampaigns);
router.get(
    '/:idCampania',
    campaignController.campaignIdValidation,
    campaignController.getCampaignById
);
router.post(
    '/',
    campaignController.createCampaignValidation,
    campaignController.createCampaign
);
router.put(
    '/:idCampania',
    [
        ...campaignController.campaignIdValidation,
        ...campaignController.updateCampaignValidation
    ],
    campaignController.updateCampaign
);
router.delete(
    '/:idCampania',
    campaignController.campaignIdValidation,
    campaignController.deleteCampaign
);

module.exports = router;
