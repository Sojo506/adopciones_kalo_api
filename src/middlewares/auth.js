const { verifyAccessToken } = require('../config/jwt');
const userService = require('../services/userService');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ ok: false, message: 'Access token required' });
    }

    try {
        const user = verifyAccessToken(token);
        const account = await userService.getAccountForAuthenticatedAccess(user);

        req.user = user;
        req.authenticatedAccount = account;
        next();
    } catch (error) {
        if (error?.name === 'JsonWebTokenError' || error?.name === 'TokenExpiredError') {
            return res.status(401).json({ ok: false, message: 'Invalid or expired token' });
        }

        if (error?.statusCode === 401) {
            return res.status(401).json({
                ok: false,
                message: error.message || 'Session is no longer active'
            });
        }

        next(error);
    }
};

const requireAdmin = async (req, res, next) => {
    try {
        const account = req.authenticatedAccount;

        if (!account || account.ID_TIPO_USUARIO !== 1) {
            return res.status(403).json({
                ok: false,
                message: 'Administrator access required'
            });
        }

        req.authenticatedAccount = account;
        next();
    } catch (error) {
        next(error);
    }
};

module.exports = { authenticateToken, requireAdmin };
