const catalogService = require('../services/catalogService');

const PUBLIC_CACHE_CONTROL = 'public, max-age=3600';

async function getUserTypes(req, res, next) {
    try {
        const userTypes = await catalogService.getUserTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: userTypes });
    } catch (error) {
        next(error);
    }
}

async function getStates(req, res, next) {
    try {
        const states = await catalogService.getStates();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: states });
    } catch (error) {
        next(error);
    }
}

async function getOtpTypes(req, res, next) {
    try {
        const otpTypes = await catalogService.getOtpTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: otpTypes });
    } catch (error) {
        next(error);
    }
}

async function getCategories(req, res, next) {
    try {
        const categories = await catalogService.getCategories();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: categories });
    } catch (error) {
        next(error);
    }
}

module.exports = { getUserTypes, getStates, getOtpTypes, getCategories };
