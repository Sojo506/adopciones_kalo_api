const userRepository = require('../repositories/userRepository');

async function getUsers() {
    return userRepository.findAllUsers();
}

module.exports = { getUsers };
