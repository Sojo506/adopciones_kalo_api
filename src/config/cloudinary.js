require('dotenv').config();
const cloudinary = require('cloudinary').v2;

function getCloudinaryConfiguration() {
    return {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || process.env.CLOUD_NAME,
        apiKey: process.env.CLOUDINARY_API_KEY || process.env.CLOUD_API_KEY,
        apiSecret: process.env.CLOUDINARY_API_SECRET || process.env.CLOUD_API_SECRET
    };
}

const { cloudName, apiKey, apiSecret } = getCloudinaryConfiguration();

cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
});

cloudinary.getCloudinaryConfiguration = getCloudinaryConfiguration;

module.exports = cloudinary;
