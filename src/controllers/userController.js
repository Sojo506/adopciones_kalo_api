const userService = require('../services/userService');
const { body, validationResult } = require('express-validator');

async function getUsers(req, res, next) {
    try {
        const users = await userService.getUsers();

        res.status(200).json({
            ok: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        next(error);
    }
}

async function getMe(req, res, next) {
    try {
        const user = await userService.getCurrentUser(req.user.idCuenta);

        res.status(200).json({
            ok: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
}

const signUpValidation = [
    body('identificacion').isNumeric().withMessage('Identificacion must be a number'),
    body('nombre').isLength({ min: 1 }).withMessage('Nombre is required'),
    body('apellidoPaterno').isLength({ min: 1 }).withMessage('Apellido Paterno is required'),
    body('apellidoMaterno').isLength({ min: 1 }).withMessage('Apellido Materno is required'),
    body('correo').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('idPais').isNumeric().withMessage('ID Pais must be a number'),
    body('idProvincia').isNumeric().withMessage('ID Provincia must be a number'),
    body('idCanton').isNumeric().withMessage('ID Canton must be a number'),
    body('idDistrito').isNumeric().withMessage('ID Distrito must be a number'),
    body('calle').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Calle must be at most 100 characters'),
    body('numero').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Numero must be at most 100 characters')
];

async function signUp(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const userData = req.body;
        const result = await userService.signUp(userData);

        res.status(201).json({
            ok: true,
            message: 'User created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const signInValidation = [
    body('correo').isEmail().withMessage('Valid email is required'),
    body('password').exists().withMessage('Password is required')
];

async function signIn(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { correo, password } = req.body;
        const result = await userService.signIn(correo, password);

        res.status(200).json({
            ok: true,
            message: 'Sign in successful',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

const verifyEmailValidation = [
    body('correo').isEmail().withMessage('Valid email is required'),
    body('code').isLength({ min: 6, max: 6 }).withMessage('Verification code must be 6 digits')
];

const resendVerificationEmailValidation = [
    body('correo').isEmail().withMessage('Valid email is required')
];

async function verifyEmail(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { correo, code } = req.body;
        const result = await userService.verifyEmail(correo, code);

        res.status(200).json({
            ok: true,
            message: result.message
        });
    } catch (error) {
        next(error);
    }
}

async function resendVerificationEmail(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const { correo } = req.body;
        const result = await userService.resendVerificationEmail(correo);

        res.status(200).json({
            ok: true,
            message: result.message,
            data: result
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getUsers,
    getMe,
    signUp,
    signIn,
    verifyEmail,
    resendVerificationEmail,
    signUpValidation,
    signInValidation,
    verifyEmailValidation,
    resendVerificationEmailValidation
};
