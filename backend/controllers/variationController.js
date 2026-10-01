const { generateVariations } = require('../services/variationService');

const generateCampaignVariations = async (req, res) => {
  try {
    const { sourceImage, analysis, creativeBrief, model, variationCount } = req.body;

    if (!sourceImage || !sourceImage.publicId) {
      return res.status(400).json({ success: false, message: 'Source image publicId is required.' });
    }

    const count = parseInt(variationCount, 10);
    if (![1, 2, 4, 8].includes(count)) {
      return res.status(400).json({ success: false, message: 'variationCount must be 1, 2, 4, or 8.' });
    }

    const { variations, failed } = await generateVariations({
      sourceImage,
      analysis,
      creativeBrief,
      model: model || { mode: 'auto', preference: 'balanced' },
      count
    });

    if (variations.length === 0) {
      return res.status(500).json({ 
        success: false, 
        message: 'All variations failed to generate. Please try again.',
        failed
      });
    }

    return res.status(200).json({
      success: true,
      variations,
      failed
    });

  } catch (error) {
    console.error('Variation Controller Error:', error);
    return res.status(500).json({ 
      success: false, 
      message: error.message || 'Variation generation failed.' 
    });
  }
};

module.exports = {
  generateCampaignVariations
};
