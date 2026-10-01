const { uploadImage } = require('../services/cloudinaryService');

const uploadProduct = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image.' });
    }

    // Process upload to Cloudinary
    const result = await uploadImage(req.file.buffer, req.file.mimetype, 'productstudio/products');

    return res.status(200).json({
      success: true,
      asset: {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
        resourceType: result.resource_type,
        originalFilename: req.file.originalname,
      }
    });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Cloudinary upload failed. Please try again.' 
    });
  }
};

module.exports = {
  uploadProduct
};
