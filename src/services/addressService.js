const addressRepository = require('../repositories/addressRepository');

async function createAddress(addressData) {
    return addressRepository.createAddress(addressData);
}

module.exports = { createAddress };
