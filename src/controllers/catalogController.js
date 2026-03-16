const catalogService = require('../services/catalogService');

async function getUserTypes(req, res, next) {
    try {
        const userTypes = await catalogService.getUserTypes();
        res.status(200).json({ ok: true, data: userTypes });
    } catch (error) {
        next(error);
    }
}

async function getStates(req, res, next) {
    try {
        const states = await catalogService.getStates();
        res.status(200).json({ ok: true, data: states });
    } catch (error) {
        next(error);
    }
}

module.exports = { getUserTypes, getStates };
