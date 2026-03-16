const jwt = require('jsonwebtoken');

const config = {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpires: "15m",
    refreshExpires: "7d"
};

function generateAccessToken(payload) {
    return jwt.sign(payload, config.accessSecret, { expiresIn: config.accessExpires });
}

function generateRefreshToken(payload) {
    return jwt.sign(payload, config.refreshSecret, { expiresIn: config.refreshExpires });
}

function verifyAccessToken(token) {
    return jwt.verify(token, config.accessSecret);
}

function verifyRefreshToken(token) {
    return jwt.verify(token, config.refreshSecret);
}

module.exports = {
    ...config,
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken
};