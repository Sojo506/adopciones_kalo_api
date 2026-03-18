const { body, param, validationResult } = require('express-validator');
const userTypeService = require('../services/userTypeService');

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

const userTypeIdValidation = [
    param('idTipoUsuario').isInt({ min: 1 }).withMessage('ID Tipo Usuario must be a positive number')
];

const userTypeValidation = [
    body('nombre')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Nombre is required and must be at most 100 characters'),
    body('idEstado').isInt({ min: 1 }).withMessage('ID Estado must be a positive number')
];

async function getUserTypes(req, res, next) {
    try {
        const userTypes = await userTypeService.getUserTypes();

        res.status(200).json({
            ok: true,
            count: userTypes.length,
            data: userTypes
        });
    } catch (error) {
        next(error);
    }
}

async function getUserTypeById(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const userType = await userTypeService.getUserTypeById(req.params.idTipoUsuario);

        res.status(200).json({
            ok: true,
            data: userType
        });
    } catch (error) {
        next(error);
    }
}

async function createUserType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const userType = await userTypeService.createUserType(req.body);

        res.status(201).json({
            ok: true,
            message: 'User type created successfully',
            data: userType
        });
    } catch (error) {
        next(error);
    }
}

async function updateUserType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        const userType = await userTypeService.updateUserType(
            req.params.idTipoUsuario,
            req.body
        );

        res.status(200).json({
            ok: true,
            message: 'User type updated successfully',
            data: userType
        });
    } catch (error) {
        next(error);
    }
}

async function deleteUserType(req, res, next) {
    try {
        if (validationErrorResponse(req, res)) {
            return;
        }

        await userTypeService.deleteUserType(req.params.idTipoUsuario);

        res.status(200).json({
            ok: true,
            message: 'User type deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUserTypes,
    getUserTypeById,
    createUserType,
    updateUserType,
    deleteUserType,
    userTypeIdValidation,
    userTypeValidation
};
