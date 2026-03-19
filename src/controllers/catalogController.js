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

async function getBrands(req, res, next) {
    try {
        const brands = await catalogService.getBrands();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: brands });
    } catch (error) {
        next(error);
    }
}

async function getMovementTypes(req, res, next) {
    try {
        const movementTypes = await catalogService.getMovementTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: movementTypes });
    } catch (error) {
        next(error);
    }
}

async function getProducts(req, res, next) {
    try {
        const products = await catalogService.getProducts();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: products });
    } catch (error) {
        next(error);
    }
}

async function getCurrencies(req, res, next) {
    try {
        const currencies = await catalogService.getCurrencies();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: currencies });
    } catch (error) {
        next(error);
    }
}

async function getBreeds(req, res, next) {
    try {
        const breeds = await catalogService.getBreeds();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: breeds });
    } catch (error) {
        next(error);
    }
}

async function getSexes(req, res, next) {
    try {
        const sexes = await catalogService.getSexes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: sexes });
    } catch (error) {
        next(error);
    }
}

async function getRequestTypes(req, res, next) {
    try {
        const requestTypes = await catalogService.getRequestTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: requestTypes });
    } catch (error) {
        next(error);
    }
}

async function getResponseTypes(req, res, next) {
    try {
        const responseTypes = await catalogService.getResponseTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: responseTypes });
    } catch (error) {
        next(error);
    }
}

async function getTrackingTypes(req, res, next) {
    try {
        const trackingTypes = await catalogService.getTrackingTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: trackingTypes });
    } catch (error) {
        next(error);
    }
}

async function getEventTypes(req, res, next) {
    try {
        const eventTypes = await catalogService.getEventTypes();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: eventTypes });
    } catch (error) {
        next(error);
    }
}

async function getQuestions(req, res, next) {
    try {
        const questions = await catalogService.getQuestions();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: questions });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserTypes,
    getStates,
    getOtpTypes,
    getCategories,
    getBrands,
    getMovementTypes,
    getProducts,
    getCurrencies,
    getBreeds,
    getSexes,
    getRequestTypes,
    getResponseTypes,
    getTrackingTypes,
    getEventTypes,
    getQuestions
};
