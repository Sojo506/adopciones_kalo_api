const jwt = require('jsonwebtoken');
const { accessSecret } = require('../config/jwt');

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

module.exports = { authenticateToken };