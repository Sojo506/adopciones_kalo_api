const userService = require('../services/userService');

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

module.exports = { getUsers };
