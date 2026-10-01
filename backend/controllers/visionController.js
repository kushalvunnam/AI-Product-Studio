const { analyzeProductImage } = require('../services/aiService');

const analyzeImage = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl || typeof imageUrl !== 'string') {
      return res.status(400).json({ success: false, message: 'Image URL is required for analysis.' });
    }
    
    // Basic validation to ensure it's a URL
    try {
      new URL(imageUrl);
    } catch (_) {
      return res.status(400).json({ success: false, message: 'Invalid Image URL provided.' });
    }

    const analysis = await analyzeProductImage(imageUrl);

    return res.status(200).json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Vision Analysis Controller Error:', error);
    
    // Don't expose internal stack traces
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Unable to analyze this image. Please try again.' 
    });
  }
};

module.exports = {
  analyzeImage
};
