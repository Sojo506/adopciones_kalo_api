const locationService = require('../services/locationService');

async function getCountries(req, res, next) {
    try {
        const countries = await locationService.getCountries();
        res.status(200).json({ ok: true, data: countries });
    } catch (error) {
        next(error);
    }
}

async function getProvinces(req, res, next) {
    try {
        const provinces = await locationService.getProvinces(Number(req.query.idPais));
        res.status(200).json({ ok: true, data: provinces });
    } catch (error) {
        next(error);
    }
}

async function getCantons(req, res, next) {
    try {
        const cantons = await locationService.getCantons(Number(req.query.idProvincia));
        res.status(200).json({ ok: true, data: cantons });
    } catch (error) {
        next(error);
    }
}

async function getDistricts(req, res, next) {
    try {
        const districts = await locationService.getDistricts(Number(req.query.idCanton));
        res.status(200).json({ ok: true, data: districts });
    } catch (error) {
        next(error);
    }
}

module.exports = { getCountries, getProvinces, getCantons, getDistricts };
