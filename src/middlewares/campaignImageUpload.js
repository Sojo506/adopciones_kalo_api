const multer = require('multer');

const MAX_CAMPAIGN_IMAGE_SIZE_BYTES = Number(
    process.env.CAMPAIGN_IMAGE_MAX_SIZE_BYTES ||
    process.env.PRODUCT_IMAGE_MAX_SIZE_BYTES ||
    5 * 1024 * 1024
);

const ALLOWED_IMAGE_MIME_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/avif',
    'image/gif'
]);

function createHttpError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
}

module.exports = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: MAX_CAMPAIGN_IMAGE_SIZE_BYTES
    },
    fileFilter: (req, file, callback) => {
        if (ALLOWED_IMAGE_MIME_TYPES.has(file.mimetype)) {
            callback(null, true);
            return;
        }

        callback(
            createHttpError(
                'Only JPG, PNG, WEBP, AVIF or GIF images are allowed',
                400
            )
        );
    }
});
