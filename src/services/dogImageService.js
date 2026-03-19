const cloudinary = require('../config/cloudinary');
const dogRepository = require('../repositories/dogRepository');
const dogImageRepository = require('../repositories/dogImageRepository');
const catalogService = require('./catalogService');
const dogService = require('./dogService');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function formatDogImage(dogImage) {
    return {
        idImagen: Number(dogImage.ID_IMAGEN),
        idPerrito: Number(dogImage.ID_PERRITO),
        nombrePerrito: dogImage.NOMBRE_PERRITO || null,
        imageUrl: dogImage.IMAGE_URL || null,
        idEstado: Number(dogImage.ID_ESTADO),
        estado: dogImage.ESTADO || null
    };
}

function sanitizeFileName(fileName) {
    return String(fileName || 'image')
        .replace(/\.[^.]+$/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 40) || 'image';
}

function ensureCloudinaryConfiguration() {
    const missingConfigKeys = [
        ['CLOUDINARY_CLOUD_NAME', 'CLOUD_NAME'],
        ['CLOUDINARY_API_KEY', 'CLOUD_API_KEY'],
        ['CLOUDINARY_API_SECRET', 'CLOUD_API_SECRET']
    ]
        .filter(([primaryKey, fallbackKey]) => !process.env[primaryKey] && !process.env[fallbackKey])
        .map(([primaryKey, fallbackKey]) => `${primaryKey} (or ${fallbackKey})`);

    if (missingConfigKeys.length) {
        throw createHttpError(
            `Missing Cloudinary configuration: ${missingConfigKeys.join(', ')}`,
            500
        );
    }
}

function ensureUploadFileExists(file) {
    if (!file?.buffer) {
        throw createHttpError('Image file is required', 400);
    }
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureDogExists(idPerrito) {
    const dog = await dogRepository.findDogById(idPerrito);

    if (!dog) {
        throw createHttpError('Dog not found', 404);
    }

    return {
        idPerrito: Number(dog.ID_PERRITO),
        nombre: dog.NOMBRE_PERRITO || dog.NOMBRE || null,
        idEstado: Number(dog.ID_ESTADO)
    };
}

function ensureActiveImageCanBelongToDog(dog, imageState) {
    if (Number(imageState) !== 1) {
        return;
    }

    if (Number(dog.idEstado) !== 1) {
        throw createHttpError(
            'Cannot assign an active image to an inactive dog',
            409
        );
    }
}

async function uploadImageToCloudinary(file, idPerrito) {
    ensureCloudinaryConfiguration();

    const folder = process.env.CLOUDINARY_DOG_IMAGES_FOLDER || 'kalo/dog-images';
    const publicId = `dog-${idPerrito}-${Date.now()}-${sanitizeFileName(file.originalname)}`;

    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: publicId,
                resource_type: 'image'
            },
            (error, result) => {
                if (error) {
                    reject(error);
                    return;
                }

                resolve(result);
            }
        );

        uploadStream.end(file.buffer);
    });
}

async function destroyCloudinaryAsset(publicId) {
    if (!publicId) {
        return;
    }

    try {
        await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (error) {
        console.error('Failed to clean Cloudinary asset:', error);
    }
}

function invalidateRelatedCaches(idPerrito, previousIdPerrito = null) {
    dogService.invalidateDogReadCaches(idPerrito);

    if (
        previousIdPerrito !== null &&
        previousIdPerrito !== undefined &&
        Number(previousIdPerrito) !== Number(idPerrito)
    ) {
        dogService.invalidateDogReadCaches(previousIdPerrito);
    }
}

async function getDogImagesByDog(idPerrito) {
    const dog = await ensureDogExists(idPerrito);
    const states = await catalogService.getStates();
    const stateNameById = new Map(
        states.map((state) => [Number(state.idEstado), state.nombre])
    );
    const dogImages = await dogImageRepository.findDogImagesByDogId(idPerrito);

    return dogImages.map((dogImage) => ({
        idImagen: Number(dogImage.ID_IMAGEN),
        idPerrito: Number(dogImage.ID_PERRITO),
        nombrePerrito: dog.nombre,
        imageUrl: dogImage.IMAGE_URL || null,
        idEstado: Number(dogImage.ID_ESTADO),
        estado: stateNameById.get(Number(dogImage.ID_ESTADO)) || null
    }));
}

async function getDogImageById(idImagen) {
    const dogImage = await dogImageRepository.findDogImageById(idImagen);

    if (!dogImage) {
        throw createHttpError('Dog image not found', 404);
    }

    return formatDogImage(dogImage);
}

async function createDogImage(dogImageData, file) {
    const requestedState =
        dogImageData.idEstado === undefined || dogImageData.idEstado === null || dogImageData.idEstado === ''
            ? 1
            : Number(dogImageData.idEstado);

    if (requestedState !== 1) {
        throw createHttpError('New dog images must start in active state', 400);
    }

    const payload = {
        idPerrito: Number(dogImageData.idPerrito),
        idEstado: requestedState
    };

    ensureUploadFileExists(file);
    await ensureStateExists(payload.idEstado);
    const dog = await ensureDogExists(payload.idPerrito);
    ensureActiveImageCanBelongToDog(dog, payload.idEstado);

    const uploadedImage = await uploadImageToCloudinary(file, payload.idPerrito);

    try {
        const result = await dogImageRepository.createDogImage({
            ...payload,
            imageUrl: uploadedImage.secure_url
        });

        invalidateRelatedCaches(payload.idPerrito);

        return getDogImageById(result.idImagen);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage.public_id);
        throw error;
    }
}

async function updateDogImage(idImagen, dogImageData, file) {
    const existingDogImage = await getDogImageById(idImagen);
    const payload = {
        idImagen: Number(idImagen),
        idPerrito: Number(dogImageData.idPerrito),
        idEstado: Number(dogImageData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const dog = await ensureDogExists(payload.idPerrito);
    ensureActiveImageCanBelongToDog(dog, payload.idEstado);

    let uploadedImage = null;
    let nextImageUrl = existingDogImage.imageUrl;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.idPerrito);
        nextImageUrl = uploadedImage.secure_url;
    }

    try {
        await dogImageRepository.updateDogImage({
            ...payload,
            imageUrl: nextImageUrl
        });

        invalidateRelatedCaches(payload.idPerrito, existingDogImage.idPerrito);

        return getDogImageById(payload.idImagen);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
}

async function deleteDogImage(idImagen) {
    const existingDogImage = await getDogImageById(idImagen);

    if (Number(existingDogImage.idEstado) !== 1) {
        throw createHttpError('Dog image is already inactive', 409);
    }

    await dogImageRepository.deleteDogImage(idImagen);
    invalidateRelatedCaches(existingDogImage.idPerrito);
}

module.exports = {
    getDogImagesByDog,
    getDogImageById,
    createDogImage,
    updateDogImage,
    deleteDogImage
};
