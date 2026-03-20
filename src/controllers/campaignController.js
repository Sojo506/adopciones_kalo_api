const { body, param, validationResult } = require('express-validator');
const campaignService = require('../services/campaignService');

function validationErrorResponse(req, res) {
    const errors = validationResult(req);

    if (errors.isEmpty()) {
        return null;
    }

    return res.status(400).json({
        ok: false,
        message: 'Validation errors',
        errors: errors.array()
    });
}

const campaignIdValidation = [
    param('idCampania')
        .isInt({ min: 1 })
        .withMessage('ID Campania must be a positive number')
];

const createCampaignValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('descripcion')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descripcion must be at most 500 characters'),
    body('fechaInicio')
        .isISO8601()
        .withMessage('Start date must be a valid ISO-8601 date'),
    body('fechaFin')
        .isISO8601()
        .withMessage('End date must be a valid ISO-8601 date'),
    body('idEstado')
        .optional({ values: 'falsy' })
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

const updateCampaignValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('descripcion')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ max: 500 })
        .withMessage('Descripcion must be at most 500 characters'),
    body('fechaInicio')
        .isISO8601()
        .withMessage('Start date must be a valid ISO-8601 date'),
    body('fechaFin')
        .isISO8601()
        .withMessage('End date must be a valid ISO-8601 date'),
    body('idEstado')
        .isInt({ min: 1 })
        .withMessage('ID Estado must be a positive number')
];

async function getCampaigns(req, res, next) {
    try {
        const campaigns = await campaignService.getCampaigns();

        res.status(200).json({
            ok: true,
            count: campaigns.length,
            data: campaigns
        });
    } catch (error) {
        next(error);
    }
}

async function getCampaignById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const campaign = await campaignService.getCampaignById(req.params.idCampania);

        res.status(200).json({
            ok: true,
            data: campaign
        });
    } catch (error) {
        next(error);
    }
}

async function createCampaign(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const campaign = await campaignService.createCampaign(req.body);

        res.status(201).json({
            ok: true,
            message: 'Campaign created successfully',
            data: campaign
        });
    } catch (error) {
        next(error);
    }
}

async function updateCampaign(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const campaign = await campaignService.updateCampaign(
            req.params.idCampania,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'Campaign updated successfully',
            data: campaign
        });
    } catch (error) {
        next(error);
    }
}

async function deleteCampaign(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await campaignService.deleteCampaign(req.params.idCampania);

        res.status(200).json({
            ok: true,
            message: 'Campaign deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getCampaigns,
    getCampaignById,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    campaignIdValidation,
    createCampaignValidation,
    updateCampaignValidation
};
