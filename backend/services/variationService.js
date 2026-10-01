const { generateImage } = require('./cloudinaryGenerationService');
const { buildVariationPrompt, variationStrategies } = require('./promptBuilder');

/**
 * Generates multiple variations using parallel Cloudinary generation requests
 */
const generateVariations = async ({ sourceImage, analysis, creativeBrief, model, count }) => {
  // Determine which strategies to use based on count
  // We'll just pick the first 'count' strategies for simplicity, or select dynamically
  const selectedStrategies = variationStrategies.slice(0, count);

  const promises = selectedStrategies.map(async (strategy) => {
    try {
      const prompt = buildVariationPrompt({ analysis, creativeBrief, variationType: strategy.id });
      
      const asset = await generateImage({
        prompt,
        referenceAsset: sourceImage,
        model,
        settings: {}
      });

      return {
        id: `var_${strategy.id}_${Date.now()}`,
        variationType: strategy.id,
        variationName: strategy.name,
        promptUsed: prompt,
        secureUrl: asset.secureUrl,
        publicId: asset.publicId,
        assetId: asset.assetId || `gen_${Date.now()}`,
        width: asset.width || sourceImage.width,
        height: asset.height || sourceImage.height,
        format: asset.format || sourceImage.format
      };
    } catch (error) {
      console.error(`Failed to generate variation ${strategy.name}:`, error);
      throw {
        variationType: strategy.id,
        variationName: strategy.name,
        error: error.message
      };
    }
  });

  const results = await Promise.allSettled(promises);
  
  const variations = [];
  const failed = [];

  results.forEach(result => {
    if (result.status === 'fulfilled') {
      variations.push(result.value);
    } else {
      failed.push(result.reason);
    }
  });

  return { variations, failed };
};

module.exports = {
  generateVariations
};
