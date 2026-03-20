const dogRepository = require('../repositories/dogRepository');
const adoptionRequestRepository = require('../repositories/adoptionRequestRepository');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function toNullableNumber(value) {
    if (value === undefined || value === null || value === '') {
        return null;
    }

    return Number(value);
}

function formatDog(row) {
    return {
        idPerrito: Number(row.ID_PERRITO),
        nombre: row.NOMBRE_PERRITO || row.NOMBRE,
        fechaIngreso: row.FECHA_INGRESO || null,
        edad: toNullableNumber(row.EDAD),
        peso: toNullableNumber(row.PESO),
        estatura: toNullableNumber(row.ESTATURA),
        idRaza: toNullableNumber(row.ID_RAZA),
        raza: row.RAZA || null,
        idSexo: toNullableNumber(row.ID_SEXO),
        sexo: row.SEXO || null,
        idEstado: toNullableNumber(row.ID_ESTADO),
        estado: row.ESTADO || null,
        imageUrl: row.IMAGE_URL || null
    };
}

function formatDogImage(row) {
    return {
        idImagen: Number(row.ID_IMAGEN),
        idPerrito: Number(row.ID_PERRITO),
        imageUrl: row.IMAGE_URL,
        idEstado: toNullableNumber(row.ID_ESTADO)
    };
}

async function getActiveAdoptedDogIds() {
    const adoptions = await adoptionRequestRepository.findAllAdoptions();

    return new Set(
        adoptions
            .filter((adoption) => Number(adoption.ID_ESTADO) === 1)
            .map((adoption) => Number(adoption.ID_PERRITO))
    );
}

function filterDogsAvailableForAdoption(dogs, adoptedDogIds) {
    return dogs.filter(
        (dog) => Number(dog.idEstado || 1) === 1 && !adoptedDogIds.has(Number(dog.idPerrito))
    );
}

async function getAvailableDogs() {
    const [dogRows, adoptedDogIds] = await Promise.all([
        dogRepository.findAvailableDogs(),
        getActiveAdoptedDogIds()
    ]);

    return filterDogsAvailableForAdoption(dogRows.map(formatDog), adoptedDogIds);
}

async function getDogById(idPerrito) {
    const [dogRow, imageRows, adoptedDogIds] = await Promise.all([
        dogRepository.findDogById(idPerrito),
        dogRepository.findDogImages(idPerrito),
        getActiveAdoptedDogIds()
    ]);

    if (!dogRow) {
        throw createHttpError('Dog not found', 404);
    }

    const dog = formatDog(dogRow);

    if (Number(dog.idEstado || 1) !== 1 || adoptedDogIds.has(Number(dog.idPerrito))) {
        throw createHttpError('Dog not available for adoption', 404);
    }

    const activeImages = imageRows
        .map(formatDogImage)
        .filter((image) => Number(image.idEstado || 1) === 1);

    return {
        ...dog,
        images: activeImages,
        imageUrl: dog.imageUrl || activeImages[0]?.imageUrl || null
    };
}

module.exports = {
    getAvailableDogs,
    getDogById
};
