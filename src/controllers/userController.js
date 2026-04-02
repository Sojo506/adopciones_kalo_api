const userService = require('../services/userService');
const { body, validationResult } = require('express-validator');
const {
    REFRESH_TOKEN_COOKIE_NAME,
    getCookieValue,
    getRefreshTokenClearCookieOptions,
    getRefreshTokenCookieOptions,
    getRequestMetadata
} = require('../utils/authCookies');
const authEventHub = require('../utils/authEventHub');
const PHONE_PATTERN = /^[0-9()+\s-]{6,20}$/;

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

async function getUserByIdentification(req, res, next) {
    try {
        const user = await userService.getUserByIdentification(req.params.identificacion);

        res.status(200).json({
            ok: true,
            data: user
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
    body('usuario').isLength({ min: 1 }).withMessage('Usuario is required'),
    body('nombre').isLength({ min: 1 }).withMessage('Nombre is required'),
    body('apellidoPaterno').isLength({ min: 1 }).withMessage('Apellido Paterno is required'),
    body('apellidoMaterno').isLength({ min: 1 }).withMessage('Apellido Materno is required'),
    body('correo').isEmail().withMessage('Valid email is required'),
    body('telefono').trim().matches(PHONE_PATTERN).withMessage('Valid phone is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('idPais').isNumeric().withMessage('ID Pais must be a number'),
    body('idProvincia').isNumeric().withMessage('ID Provincia must be a number'),
    body('idCanton').isNumeric().withMessage('ID Canton must be a number'),
    body('idDistrito').isNumeric().withMessage('ID Distrito must be a number'),
    body('calle').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Calle must be at most 100 characters'),
    body('numero').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Numero must be at most 100 characters')
];

const dashboardUserValidation = [
    body('identificacion').isNumeric().withMessage('Identificacion must be a number'),
    body('usuario').isLength({ min: 1 }).withMessage('Usuario is required'),
    body('nombre').isLength({ min: 1 }).withMessage('Nombre is required'),
    body('apellidoPaterno').isLength({ min: 1 }).withMessage('Apellido Paterno is required'),
    body('apellidoMaterno').isLength({ min: 1 }).withMessage('Apellido Materno is required'),
    body('correo').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('idTipoUsuario').isNumeric().withMessage('ID Tipo Usuario must be a number'),
    body('idEstado').isNumeric().withMessage('ID Estado must be a number'),
    body('idPais').isNumeric().withMessage('ID Pais must be a number'),
    body('idProvincia').isNumeric().withMessage('ID Provincia must be a number'),
    body('idCanton').isNumeric().withMessage('ID Canton must be a number'),
    body('idDistrito').isNumeric().withMessage('ID Distrito must be a number'),
    body('calle').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Calle must be at most 100 characters'),
    body('numero').optional({ values: 'falsy' }).isLength({ max: 100 }).withMessage('Numero must be at most 100 characters')
];

const dashboardUserUpdateValidation = [
    body('usuario').isLength({ min: 1 }).withMessage('Usuario is required'),
    body('nombre').isLength({ min: 1 }).withMessage('Nombre is required'),
    body('apellidoPaterno').isLength({ min: 1 }).withMessage('Apellido Paterno is required'),
    body('apellidoMaterno').isLength({ min: 1 }).withMessage('Apellido Materno is required'),
    body('correo').isEmail().withMessage('Valid email is required'),
    body('password').optional({ values: 'falsy' }).isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('idTipoUsuario').isNumeric().withMessage('ID Tipo Usuario must be a number'),
    body('idEstado').isNumeric().withMessage('ID Estado must be a number'),
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

async function createDashboardUser(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const result = await userService.createDashboardUser(req.body);

        res.status(201).json({
            ok: true,
            message: 'User created successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function updateDashboardUser(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const result = await userService.updateDashboardUser(
            req.params.identificacion,
            req.body,
            req.authenticatedAccount
        );

        res.status(200).json({
            ok: true,
            message: 'User updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function deleteDashboardUser(req, res, next) {
    try {
        await userService.deleteDashboardUser(req.params.identificacion, req.authenticatedAccount);

        res.status(200).json({
            ok: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        next(error);
    }
}

const signInValidation = [
    body('usuario').isLength({ min: 1 }).withMessage('Usuario is required'),
    body('password').exists().withMessage('Password is required')
];

const passwordRecoveryRequestValidation = [
    body('identifier').trim().isLength({ min: 1 }).withMessage('Identifier is required')
];

const passwordRecoveryConfirmValidation = [
    body('identifier').trim().isLength({ min: 1 }).withMessage('Identifier is required'),
    body('codigo')
        .trim()
        .isLength({ min: 6, max: 6 })
        .withMessage('Codigo must contain 6 digits')
        .isNumeric()
        .withMessage('Codigo must contain only digits'),
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
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

        const { usuario, password } = req.body;
        const result = await userService.signIn(usuario, password, getRequestMetadata(req));

        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            result.refreshToken,
            getRefreshTokenCookieOptions(result.refreshTokenExpiresAt)
        );

        res.status(200).json({
            ok: true,
            message: 'Sign in successful',
            data: {
                user: result.user,
                accessToken: result.accessToken
            }
        });
    } catch (error) {
        next(error);
    }
}

async function requestPasswordRecovery(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        await userService.requestPasswordRecovery(req.body.identifier);

        res.status(200).json({
            ok: true,
            message: 'If the account is eligible, a verification code has been sent to the registered email'
        });
    } catch (error) {
        next(error);
    }
}

async function confirmPasswordRecovery(req, res, next) {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                ok: false,
                message: 'Validation errors',
                errors: errors.array()
            });
        }

        const result = await userService.confirmPasswordRecovery(
            req.body.identifier,
            req.body.codigo,
            req.body.newPassword
        );

        res.status(200).json({
            ok: true,
            message: 'Password updated successfully',
            data: result
        });
    } catch (error) {
        next(error);
    }
}

async function refreshSession(req, res, next) {
    try {
        const result = await userService.refreshSession(
            getCookieValue(req, REFRESH_TOKEN_COOKIE_NAME),
            getRequestMetadata(req)
        );

        res.cookie(
            REFRESH_TOKEN_COOKIE_NAME,
            result.refreshToken,
            getRefreshTokenCookieOptions(result.refreshTokenExpiresAt)
        );

        res.status(200).json({
            ok: true,
            message: 'Token refreshed successfully',
            data: {
                accessToken: result.accessToken,
                user: result.user
            }
        });
    } catch (error) {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());
        next(error);
    }
}

async function sessionEvents(req, res, next) {
    try {
        const account = await userService.getAccountForActiveRefreshSession(
            getCookieValue(req, REFRESH_TOKEN_COOKIE_NAME)
        );

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache, no-transform');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('X-Accel-Buffering', 'no');
        res.flushHeaders?.();
        res.write('retry: 10000\n\n');

        const disconnect = authEventHub.registerAccountConnection(account.ID_CUENTA, res);
        req.on('close', disconnect);
    } catch (error) {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());
        next(error);
    }
}

async function logout(req, res, next) {
    try {
        await userService.logout(getCookieValue(req, REFRESH_TOKEN_COOKIE_NAME));
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());

        res.status(200).json({
            ok: true,
            message: 'Logout successful'
        });
    } catch (error) {
        res.clearCookie(REFRESH_TOKEN_COOKIE_NAME, getRefreshTokenClearCookieOptions());
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
    getUserByIdentification,
    getMe,
    signUp,
    createDashboardUser,
    updateDashboardUser,
    deleteDashboardUser,
    signIn,
    requestPasswordRecovery,
    confirmPasswordRecovery,
    refreshSession,
    sessionEvents,
    logout,
    verifyEmail,
    resendVerificationEmail,
    signUpValidation,
    dashboardUserValidation,
    dashboardUserUpdateValidation,
    signInValidation,
    passwordRecoveryRequestValidation,
    passwordRecoveryConfirmValidation,
    verifyEmailValidation,
    resendVerificationEmailValidation
};
