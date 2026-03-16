const locationRepository = require('../repositories/locationRepository');

async function getCountries() {
    const countries = await locationRepository.findCountries();
    return countries.map((country) => ({
        idPais: country.ID_PAIS,
        nombre: country.NOMBRE
    }));
}

async function getProvinces(idPais) {
    const provinces = await locationRepository.findProvincesByCountry(idPais);
    return provinces.map((province) => ({
        idProvincia: province.ID_PROVINCIA,
        idPais: province.ID_PAIS,
        nombre: province.NOMBRE
    }));
}

async function getCantons(idProvincia) {
    const cantons = await locationRepository.findCantonsByProvince(idProvincia);
    return cantons.map((canton) => ({
        idCanton: canton.ID_CANTON,
        idProvincia: canton.ID_PROVINCIA,
        nombre: canton.NOMBRE
    }));
}

async function getDistricts(idCanton) {
    const districts = await locationRepository.findDistrictsByCanton(idCanton);
    return districts.map((district) => ({
        idDistrito: district.ID_DISTRITO,
        idCanton: district.ID_CANTON,
        nombre: district.NOMBRE
    }));
}

module.exports = { getCountries, getProvinces, getCantons, getDistricts };
