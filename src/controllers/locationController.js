const locationService = require('../services/locationService');

const PUBLIC_CACHE_CONTROL = 'public, max-age=3600';

async function getCountries(req, res, next) {
    try {
        const countries = await locationService.getCountries();
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: countries });
    } catch (error) {
        next(error);
    }
}

async function getProvinces(req, res, next) {
    try {
        const provinces = await locationService.getProvinces(Number(req.query.idPais));
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: provinces });
    } catch (error) {
        next(error);
    }
}

async function getCantons(req, res, next) {
    try {
        const cantons = await locationService.getCantons(Number(req.query.idProvincia));
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: cantons });
    } catch (error) {
        next(error);
    }
}

async function getDistricts(req, res, next) {
    try {
        const districts = await locationService.getDistricts(Number(req.query.idCanton));
        res.set('Cache-Control', PUBLIC_CACHE_CONTROL);
        res.status(200).json({ ok: true, data: districts });
    } catch (error) {
        next(error);
    }
}

module.exports = { getCountries, getProvinces, getCantons, getDistricts };
