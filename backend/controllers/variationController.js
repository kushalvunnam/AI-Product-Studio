const { generateVariations } = require('../services/variationService');
const Campaign = require('../models/Campaign');

const generateCampaignVariations = async (req, res) => {
  try {
    const { campaignId, sourceImage, analysis, creativeBrief, model, variationCount } = req.body;

    if (!sourceImage || !sourceImage.publicId) {
      return res.status(400).json({ success: false, message: 'Source image publicId is required.' });
    }

    const count = parseInt(variationCount, 10) || 4;
    
    if (campaignId) {
      // Async background generation
      generateVariations({
        sourceImage,
        analysis,
        creativeBrief,
        model: model || { mode: 'auto', preference: 'balanced' },
        count
      }).then(async (result) => {
        if (result.variations.length > 0) {
          await Campaign.findByIdAndUpdate(campaignId, { variations: result.variations, status: 'review' });
        } else {
          const errMsg = result.failed && result.failed.length > 0 ? result.failed[0].error : 'All variations failed to generate.';
          await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: errMsg });
        }
      }).catch(async (err) => {
        console.error('Async generation failed:', err);
        await Campaign.findByIdAndUpdate(campaignId, { status: 'failed', errorMessage: err.message || 'Generation failed on the server.' });
      });

      return res.status(202).json({
        success: true,
        message: 'Generation started asynchronously.',
        isAsync: true
      });
    }

    // Fallback synchronous generation
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