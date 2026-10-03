const { buildGenerationPrompt } = require('../services/promptBuilder');
const { routeGeneration, getConfiguredModels } = require('../services/generationProviderService');

const getModels = async (req, res) => {
  try {
    const models = await getConfiguredModels();
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); res.setHeader('Pragma', 'no-cache'); res.setHeader('Expires', '0'); res.setHeader('Surrogate-Control', 'no-store'); return res.status(200).json({ success: true, models });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch models' });
  }
};

const generateCampaignImage = async (req, res) => {
  try {
    const { sourceImage, analysis, creativeBrief, model } = req.body;

    if (!sourceImage || !sourceImage.publicId) {
      return res.status(400).json({ success: false, message: 'Source image publicId is required.' });
    }

    if (!creativeBrief) {
      return res.status(400).json({ success: false, message: 'Creative brief is required.' });
    }

    // 1. Build the prompt
    const prompt = buildGenerationPrompt({ analysis, creativeBrief });

    // 2. Call Image Generation Provider
    const asset = await routeGeneration({
      prompt,
      referenceAsset: sourceImage,
      model: model || { id: 'auto', mode: 'auto', preference: 'balanced' },
      settings: {}
    });

    // 3. Return the generated asset metadata
    return res.status(200).json({
      success: true,
      asset: {
        secureUrl: asset.secureUrl,
        publicId: asset.publicId, // Original publicId
        assetId: asset.assetId || 'generated_' + Date.now(),
        width: asset.width || sourceImage.width,
        height: asset.height || sourceImage.height,
        format: asset.format || sourceImage.format
      },
      generation: {
        prompt,
        model: model?.id || 'auto',
        preference: model?.preference || 'balanced',
        sourceAsset: sourceImage.publicId
      }
    });

  } catch (error) {
    console.error('Generation Controller Error:', error);
    return res.status(error.code === 'MISSING_API_KEY' ? 400 : 500).json({ 
      success: false, 
      error: {
        code: error.code || 'GENERATION_FAILED',
        provider: error.provider || 'unknown',
        model: error.model || 'unknown',
        message: error.message || 'Generation failed. Please try again.'
      },
      message: error.message || 'Generation failed. Please try again.' 
    });
  }
};

module.exports = {
  getModels,
  generateCampaignImage
};
