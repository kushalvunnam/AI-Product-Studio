const cloudinary = require('../config/cloudinary');
const transformationPresets = require('../config/transformationPresets');

/**
 * Upload an image to Cloudinary from a buffer
 * @param {Buffer} fileBuffer - Image buffer
 * @param {string} mimeType - Image mime type
 * @param {string} folder - Folder name in Cloudinary
 * @returns {Promise<Object>} - Cloudinary upload response
 */
const uploadImage = async (fileBuffer, mimeType, folder = 'productstudio/products') => {
  try {
    const base64Image = fileBuffer.toString('base64');
    const dataUri = `data:${mimeType};base64,${base64Image}`;
    
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder,
      resource_type: 'auto',
    });
    return uploadResponse;
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    throw new Error('Failed to upload image to Cloudinary');
  }
};

/**
 * Apply transformations to an existing Cloudinary image and generate optimized delivery URLs
 * @param {Object} params
 * @param {string} params.publicId - Cloudinary public ID
 * @param {string} params.platform - Target platform preset (e.g. instagram, story)
 * @param {Object} params.options - Additional transformation options
 * @returns {Promise<Object>} - Transformed asset metadata
 */
const transformImage = async ({ publicId, platform, options = {} }) => {
  return new Promise((resolve, reject) => {
    try {
      const preset = transformationPresets[platform];
      if (!preset) {
        throw new Error(`Unsupported platform: ${platform}`);
      }

      // Generate the dynamic delivery URL with automatic format and quality optimization
      // Smart crop (gravity: auto) ensures the product stays in focus
      const secureUrl = cloudinary.url(publicId, {
        secure: true,
        width: preset.width,
        height: preset.height,
        crop: preset.crop || 'fill',
        gravity: preset.gravity || 'auto',
        fetch_format: 'auto',
        quality: 'auto',
        ...options
      });

      resolve({
        platform,
        platformName: preset.name,
        secureUrl,
        publicId,
        width: preset.width,
        height: preset.height,
        format: 'auto'
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  uploadImage,
  transformImage
};
