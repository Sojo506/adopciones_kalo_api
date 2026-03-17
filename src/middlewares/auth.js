const jwt = require('jsonwebtoken');
const { accessSecret } = require('../config/jwt');
const userRepository = require('../repositories/userRepository');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ ok: false, message: 'Access token required' });
    }

    jwt.verify(token, accessSecret, (err, user) => {
        if (err) {
            return res.status(403).json({ ok: false, message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = async (req, res, next) => {
    try {
        const account = await userRepository.findAccountByIdCuenta(req.user.idCuenta);

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
