const cloudinary = require('../config/cloudinary');
const productRepository = require('../repositories/productRepository');
const productImageRepository = require('../repositories/productImageRepository');
const catalogService = require('./catalogService');
const productService = require('./productService');

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

function formatProductImage(productImage) {
    return {
        idImagen: productImage.ID_IMAGEN,
        idProducto: productImage.ID_PRODUCTO,
        producto: productImage.PRODUCTO || null,
        imageUrl: productImage.IMAGE_URL || null,
        idEstado: productImage.ID_ESTADO,
        estado: productImage.ESTADO || null
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
    const missingConfigKeys = ['CLOUD_NAME', 'CLOUD_API_KEY', 'CLOUD_API_SECRET'].filter(
        (key) => !process.env[key]
    );

    if (missingConfigKeys.length) {
        throw createHttpError(
            `Missing Cloudinary configuration: ${missingConfigKeys.join(', ')}`,
            500
        );
    }
}

async function ensureStateExists(idEstado) {
    const states = await catalogService.getStates();
    const stateExists = states.some((state) => Number(state.idEstado) === Number(idEstado));

    if (!stateExists) {
        throw createHttpError('State not found', 400);
    }
}

async function ensureProductExists(idProducto) {
    const product = await productRepository.findProductById(idProducto);

    if (!product) {
        throw createHttpError('Product not found', 404);
    }

    return {
        idProducto: product.ID_PRODUCTO,
        nombre: product.NOMBRE,
        idEstado: product.ID_ESTADO
    };
}

function ensureActiveImageCanBelongToProduct(product, imageState) {
    if (Number(imageState) !== 1) {
        return;
    }

    if (Number(product.idEstado) !== 1) {
        throw createHttpError(
            'Cannot assign an active image to an inactive product',
            409
        );
    }
}

function ensureUploadFileExists(file) {
    if (!file?.buffer) {
        throw createHttpError('Image file is required', 400);
    }
}

async function uploadImageToCloudinary(file, idProducto) {
    ensureCloudinaryConfiguration();

    const folder = process.env.CLOUDINARY_PRODUCT_IMAGES_FOLDER || 'kalo/product-images';
    const publicId = `product-${idProducto}-${Date.now()}-${sanitizeFileName(file.originalname)}`;

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

function invalidateRelatedCaches(idProducto, previousIdProducto = null) {
    productService.invalidateProductReadCaches(idProducto);

    if (
        previousIdProducto !== null &&
        previousIdProducto !== undefined &&
        Number(previousIdProducto) !== Number(idProducto)
    ) {
        productService.invalidateProductReadCaches(previousIdProducto);
    }
}

async function getProductImagesByProduct(idProducto) {
    const product = await ensureProductExists(idProducto);
    const states = await catalogService.getStates();
    const stateNameById = new Map(
        states.map((state) => [Number(state.idEstado), state.nombre])
    );
    const productImages = await productImageRepository.findProductImagesByProductId(idProducto);

    return productImages.map((productImage) => ({
        idImagen: productImage.ID_IMAGEN,
        idProducto: productImage.ID_PRODUCTO,
        producto: product.nombre,
        imageUrl: productImage.IMAGE_URL || null,
        idEstado: productImage.ID_ESTADO,
        estado: stateNameById.get(Number(productImage.ID_ESTADO)) || null
    }));
}

async function getProductImageById(idImagen) {
    const productImage = await productImageRepository.findProductImageById(idImagen);

    if (!productImage) {
        throw createHttpError('Product image not found', 404);
    }

    return formatProductImage(productImage);
}

async function createProductImage(productImageData, file) {
    const payload = {
        idProducto: Number(productImageData.idProducto),
        idEstado: Number(productImageData.idEstado || 1)
    };

    ensureUploadFileExists(file);
    await ensureStateExists(payload.idEstado);
    const product = await ensureProductExists(payload.idProducto);
    ensureActiveImageCanBelongToProduct(product, payload.idEstado);

    const uploadedImage = await uploadImageToCloudinary(file, payload.idProducto);

    try {
        const result = await productImageRepository.createProductImage({
            ...payload,
            imageUrl: uploadedImage.secure_url
        });

        invalidateRelatedCaches(payload.idProducto);

        return getProductImageById(result.idImagen);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage.public_id);
        throw error;
    }
}

async function updateProductImage(idImagen, productImageData, file) {
    const existingProductImage = await getProductImageById(idImagen);
    const payload = {
        idImagen: Number(idImagen),
        idProducto: Number(productImageData.idProducto),
        idEstado: Number(productImageData.idEstado)
    };

    await ensureStateExists(payload.idEstado);
    const product = await ensureProductExists(payload.idProducto);
    ensureActiveImageCanBelongToProduct(product, payload.idEstado);

    let uploadedImage = null;
    let nextImageUrl = existingProductImage.imageUrl;

    if (file?.buffer) {
        uploadedImage = await uploadImageToCloudinary(file, payload.idProducto);
        nextImageUrl = uploadedImage.secure_url;
    }

    try {
        await productImageRepository.updateProductImage({
            ...payload,
            imageUrl: nextImageUrl
        });

        invalidateRelatedCaches(payload.idProducto, existingProductImage.idProducto);

        return getProductImageById(payload.idImagen);
    } catch (error) {
        await destroyCloudinaryAsset(uploadedImage?.public_id);
        throw error;
    }
}

async function deleteProductImage(idImagen) {
    const existingProductImage = await getProductImageById(idImagen);

    if (Number(existingProductImage.idEstado) !== 1) {
        throw createHttpError('Product image is already inactive', 409);
    }

    await productImageRepository.deleteProductImage(idImagen);
    invalidateRelatedCaches(existingProductImage.idProducto);
}

module.exports = {
    getProductImagesByProduct,
    getProductImageById,
    createProductImage,
    updateProductImage,
    deleteProductImage
};
