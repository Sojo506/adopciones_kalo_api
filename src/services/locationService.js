const locationRepository = require('../repositories/locationRepository');
const MemoryCache = require('../utils/memoryCache');

const ONE_HOUR_MS = 60 * 60 * 1000;
const locationCache = new MemoryCache({ defaultTtlMs: ONE_HOUR_MS });

async function getCountries() {
    return locationCache.getOrSet('location:countries', async () => {
        const countries = await locationRepository.findCountries();
        return countries.map((country) => ({
            idPais: country.ID_PAIS,
            nombre: country.NOMBRE
        }));
    });
}

async function getProvinces(idPais) {
    return locationCache.getOrSet(`location:provinces:${idPais}`, async () => {
        const provinces = await locationRepository.findProvincesByCountry(idPais);
        return provinces.map((province) => ({
            idProvincia: province.ID_PROVINCIA,
            idPais: province.ID_PAIS,
            nombre: province.NOMBRE
        }));
    });
}

async function getCantons(idProvincia) {
    return locationCache.getOrSet(`location:cantons:${idProvincia}`, async () => {
        const cantons = await locationRepository.findCantonsByProvince(idProvincia);
        return cantons.map((canton) => ({
            idCanton: canton.ID_CANTON,
            idProvincia: canton.ID_PROVINCIA,
            nombre: canton.NOMBRE
        }));
    });
}

async function getDistricts(idCanton) {
    return locationCache.getOrSet(`location:districts:${idCanton}`, async () => {
        const districts = await locationRepository.findDistrictsByCanton(idCanton);
        return districts.map((district) => ({
            idDistrito: district.ID_DISTRITO,
            idCanton: district.ID_CANTON,
            nombre: district.NOMBRE
        }));
    });
}

function invalidateCountriesCache() {
    locationCache.delete('location:countries');
}

function invalidateProvincesCache(idPais = null) {
    if (idPais !== null && idPais !== undefined) {
        locationCache.delete(`location:provinces:${idPais}`);
        return;
    }

    locationCache.clearByPrefix('location:provinces:');
}

function invalidateCantonsCache(idProvincia = null) {
    if (idProvincia !== null && idProvincia !== undefined) {
        locationCache.delete(`location:cantons:${idProvincia}`);
        return;
    }

    locationCache.clearByPrefix('location:cantons:');
}

function invalidateDistrictsCache(idCanton = null) {
    if (idCanton !== null && idCanton !== undefined) {
        locationCache.delete(`location:districts:${idCanton}`);
        return;
    }

    locationCache.clearByPrefix('location:districts:');
}

module.exports = {
    getCountries,
    getProvinces,
    getCantons,
    getDistricts,
    invalidateCountriesCache,
    invalidateProvincesCache,
    invalidateCantonsCache,
    invalidateDistrictsCache
};
